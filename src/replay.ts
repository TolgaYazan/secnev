import { createRequire } from "node:module";
import { config } from "./config.js";

const require = createRequire(import.meta.url);
const replayConfig = require("../config/replay.json") as Record<
  string,
  {
    symbol: string;
    typeHash: string;
    decimals: number;
    startDate: string;
    source: string;
  }
>;

interface ExplorerCell {
  extra_info?: { type_hash?: string; amount?: string };
  xudt_info?: { type_hash?: string; amount?: string };
  xudt_compatible_info?: { type_hash?: string; amount?: string };
}

interface ExplorerTx {
  attributes: {
    transaction_hash: string;
    created_at: string;
    display_inputs?: ExplorerCell[];
    display_outputs?: ExplorerCell[];
  };
}

interface ListTx {
  hash: string;
  date: string;
  candidateNet: bigint;
}

export interface ReplayEvent {
  date: string;
  net: string;
  netHuman: number;
  gross: string;
  grossHuman: number;
  txs: number;
  largestTx: string;
}

export interface ReplayResult {
  symbol: string;
  typeHash: string;
  source: string;
  pages: number;
  transactions: number;
  firstDate: string | null;
  lastDate: string | null;
  detailedTransactions: number;
  windowNet: string;
  windowNetHuman: number;
  events: ReplayEvent[];
}

function amountFor(cell: ExplorerCell, typeHash: string): bigint {
  const info = cell.extra_info ?? cell.xudt_info ?? cell.xudt_compatible_info;
  if (!info || String(info.type_hash ?? "").toLowerCase() !== typeHash.toLowerCase()) {
    return 0n;
  }
  try {
    return BigInt(info.amount ?? "0");
  } catch {
    return 0n;
  }
}

function amountsFor(
  tx: ExplorerTx,
  typeHash: string,
): { inputs: bigint; outputs: bigint } {
  const attrs = tx.attributes;
  return {
    inputs: (attrs.display_inputs ?? []).reduce(
      (acc, c) => acc + amountFor(c, typeHash),
      0n,
    ),
    outputs: (attrs.display_outputs ?? []).reduce(
      (acc, c) => acc + amountFor(c, typeHash),
      0n,
    ),
  };
}

function netFor(tx: ExplorerTx, typeHash: string): bigint {
  const { inputs, outputs } = amountsFor(tx, typeHash);
  return outputs - inputs;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
      "user-agent": config.userAgent,
    },
  });
  if (!res.ok) throw new Error(`Explorer replay HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function fetchPage(
  typeHash: string,
  page: number,
  pageSize = 100,
): Promise<{ data: ExplorerTx[]; total: number }> {
  const json = await fetchJson<{
    data?: ExplorerTx[];
    meta?: { total?: number };
  }>(
    `${config.explorerUrl}/udt_transactions/${encodeURIComponent(typeHash)}?page=${page}&page_size=${pageSize}`,
  );
  return { data: json.data ?? [], total: json.meta?.total ?? 0 };
}

async function fetchTransaction(hash: string): Promise<ExplorerTx | null> {
  try {
    const json = await fetchJson<{ data?: ExplorerTx }>(
      `${config.explorerUrl}/transactions/${encodeURIComponent(hash)}`,
    );
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      out[index] = await fn(items[index]!);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Replay dCKB from real historical transactions.
 *
 * The Explorer's UDT list is used to find transactions whose UDT view shows a
 * non-zero change; each candidate is then fetched through the full transaction
 * endpoint, which includes change outputs the UDT view omits. The result is an
 * accurate daily net mint/burn series for the replay window.
 */
export async function runReplay(symbol = "dCKB"): Promise<ReplayResult> {
  const def = replayConfig[symbol];
  if (!def) throw new Error(`No replay config for ${symbol}`);

  const list: ListTx[] = [];
  let pages = 0;
  let transactions = 0;
  let firstDate: string | null = null;
  let lastDate: string | null = null;

  for (let page = 1; page <= 50; page++) {
    const { data, total } = await fetchPage(def.typeHash, page);
    if (page === 1) transactions = total;
    if (data.length === 0) break;
    pages += 1;
    for (const tx of data) {
      const attrs = tx.attributes;
      const date = String(attrs.created_at ?? "").slice(0, 10);
      if (!date) continue;
      if (!firstDate || date < firstDate) firstDate = date;
      if (!lastDate || date > lastDate) lastDate = date;
      const candidateNet = netFor(tx, def.typeHash);
      if (candidateNet !== 0n && date >= def.startDate) {
        list.push({ hash: attrs.transaction_hash, date, candidateNet });
      }
    }
    if (data.length < 100) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Full transaction details include change outputs that the UDT view omits.
  const detailed = await mapLimit(list, 5, async (tx) => {
    const full = await fetchTransaction(tx.hash);
    if (!full) {
      return {
        ...tx,
        net: tx.candidateNet,
        volume: tx.candidateNet < 0n ? -tx.candidateNet : tx.candidateNet,
        accurate: false,
      };
    }
    const { inputs, outputs } = amountsFor(full, def.typeHash);
    return {
      ...tx,
      net: outputs - inputs,
      volume: inputs > outputs ? inputs : outputs,
      accurate: true,
    };
  });

  const daily = new Map<
    string,
    {
      net: bigint;
      gross: bigint;
      txs: number;
      largest: bigint;
      largestTx: string;
    }
  >();
  let windowNet = 0n;
  for (const tx of detailed) {
    windowNet += tx.net;
    const day =
      daily.get(tx.date) ?? {
        net: 0n,
        gross: 0n,
        txs: 0,
        largest: 0n,
        largestTx: "",
      };
    day.net += tx.net;
    day.gross += tx.volume;
    day.txs += 1;
    if (tx.volume > (day.largest < 0n ? -day.largest : day.largest)) {
      day.largest = tx.volume;
      day.largestTx = tx.hash;
    }
    daily.set(tx.date, day);
  }

  const events: ReplayEvent[] = [...daily.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, day]) => ({
      date,
      net: day.net.toString(),
      netHuman: Number(day.net) / 10 ** def.decimals,
      gross: day.gross.toString(),
      grossHuman: Number(day.gross) / 10 ** def.decimals,
      txs: day.txs,
      largestTx: day.largestTx,
    }));

  return {
    symbol: def.symbol,
    typeHash: def.typeHash,
    source: def.source.replace("{typeHash}", def.typeHash),
    pages,
    transactions,
    firstDate,
    lastDate,
    detailedTransactions: detailed.length,
    windowNet: windowNet.toString(),
    windowNetHuman: Number(windowNet) / 10 ** def.decimals,
    events,
  };
}
