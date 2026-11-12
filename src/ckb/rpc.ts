import { config } from "../config.js";
import { lockMeta } from "../labels.js";
import type { CellSummary } from "../types.js";

export interface RpcScript {
  code_hash: string;
  hash_type: string;
  args: string;
}

export interface RpcCell {
  out_point: { tx_hash: string; index: string };
  output: {
    capacity: string;
    lock: RpcScript;
    type: RpcScript | null;
  };
  output_data: string;
  block_number: string;
  tx_index: string;
}

interface GetCellsResult {
  objects: RpcCell[];
  last_cursor: string | null;
}

let rpcId = 0;

export async function rpcCall<T>(
  method: string,
  params: unknown[],
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.ingestTimeoutMs);
  try {
    const res = await fetch(config.ckbRpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": config.userAgent,
      },
      body: JSON.stringify({
        id: ++rpcId,
        jsonrpc: "2.0",
        method,
        params,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`CKB RPC ${method}: HTTP ${res.status}`);
    const json = (await res.json()) as {
      result?: T;
      error?: { code: number; message: string };
    };
    if (json.error) {
      throw new Error(`CKB RPC ${method}: ${json.error.message}`);
    }
    return json.result as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getTip(): Promise<{
  number: number;
  hash: string;
  timestamp: number;
}> {
  const h = await rpcCall<{
    number: string;
    hash: string;
    timestamp: string;
  }>("get_tip_header", []);
  return {
    number: Number.parseInt(h.number, 16),
    hash: h.hash,
    timestamp: Number.parseInt(h.timestamp, 16),
  };
}

/** Parse the first 16 bytes of xUDT/sUDT cell data as a little-endian u128. */
export function parseU128LE(data: string): bigint {
  const hex = (data ?? "").replace(/^0x/i, "");
  if (hex.length < 32) return 0n;
  const bytes = hex.slice(0, 32).match(/.{2}/g) ?? [];
  let value = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << 8n) | BigInt(Number.parseInt(bytes[i]!, 16));
  }
  return value;
}

export async function getCellsByScript(
  script: RpcScript,
  scriptType: "lock" | "type",
  maxPages = config.maxCellPages,
): Promise<{ cells: RpcCell[]; partial: boolean; pages: number }> {
  const cells: RpcCell[] = [];
  let cursor: string | null = null;
  let pages = 0;
  const startedAt = Date.now();
  const pageLimit =
    maxPages > 0 ? maxPages : Number.POSITIVE_INFINITY;
  for (; pages < pageLimit; pages++) {
    if (Date.now() - startedAt > config.cellScanBudgetMs) {
      return { cells, partial: true, pages };
    }
    const params: unknown[] = [
      {
        script,
        script_type: scriptType,
      },
      "asc",
      `0x${config.cellPageSize.toString(16)}`,
    ];
    if (cursor) params.push(cursor);
    const result = await rpcCall<GetCellsResult>("get_cells", params);
    const objects = result.objects ?? [];
    cells.push(...objects);
    // The public RPC keeps returning a cursor after the last page; an empty
    // page is the reliable end-of-scan signal.
    if (objects.length === 0 || !result.last_cursor) {
      return { cells, partial: false, pages: pages + 1 };
    }
    cursor = result.last_cursor;
  }
  return { cells, partial: true, pages };
}

export async function getCellsByType(
  type: RpcScript,
  maxPages = config.maxCellPages,
): Promise<{ cells: RpcCell[]; partial: boolean; pages: number }> {
  return getCellsByScript(type, "type", maxPages);
}

export async function getCellsByLock(
  lock: RpcScript,
  maxPages = config.maxCellPages,
): Promise<{ cells: RpcCell[]; partial: boolean; pages: number }> {
  return getCellsByScript(lock, "lock", maxPages);
}

export function summarizeCells(
  cells: RpcCell[],
  totalSupply?: bigint,
  partial = false,
  pages = 1,
): CellSummary {
  const byHolder = new Map<
    string,
    {
      lockKey: string;
      lockName: string | null;
      labelKind:
        | "wallet"
        | "protocol"
        | "dex"
        | "whale"
        | "market_maker"
        | "unknown";
      excludeFromOrganic: boolean;
      amount: bigint;
      cells: number;
    }
  >();
  const byLock = new Map<
    string,
    { codeHash: string; name: string | null; holders: Set<string> }
  >();
  let total = 0n;

  for (const cell of cells) {
    const amount = parseU128LE(cell.output_data);
    if (amount <= 0n) continue;
    total += amount;
    const lock = cell.output.lock;
    const key = `${lock.code_hash}:${lock.hash_type}:${lock.args}`;
    const meta = lockMeta(lock.code_hash);
    const h = byHolder.get(key);
    if (h) {
      h.amount += amount;
      h.cells += 1;
    } else {
      byHolder.set(key, {
        lockKey: key,
        lockName: meta.name,
        labelKind: meta.kind,
        excludeFromOrganic: meta.excludeFromOrganic,
        amount,
        cells: 1,
      });
    }
    const l = byLock.get(lock.code_hash);
    if (l) {
      l.holders.add(key);
    } else {
      byLock.set(lock.code_hash, {
        codeHash: lock.code_hash,
        name: meta.name,
        holders: new Set([key]),
      });
    }
  }

  const denominator = totalSupply && totalSupply > 0n ? totalSupply : total;
  const holders = [...byHolder.values()]
    .sort((a, b) => (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0))
    .map((h) => ({
      ...h,
      share: denominator > 0n ? Number((h.amount * 1_000_000n) / denominator) / 1_000_000 : 0,
    }));

  const lockDistribution = [...byLock.values()]
    .map((l) => ({
      codeHash: l.codeHash,
      name: l.name,
      holders: l.holders.size,
      share: holders.length > 0 ? l.holders.size / holders.length : 0,
    }))
    .sort((a, b) => b.holders - a.holders);

  return {
    totalAmount: total,
    cellCount: cells.length,
    holderCount: holders.length,
    holders,
    lockDistribution,
    partial,
    pages,
  };
}
