import { createRequire } from "node:module";
import { Address, ClientPublicMainnet } from "@ckb-ccc/core";
import { config } from "./config.js";
import { getCellsByLock } from "./ckb/rpc.js";
import { lockMeta } from "./labels.js";

const require = createRequire(import.meta.url);
const addressLabels = require("../config/address_labels.json") as Record<
  string,
  { label: string; kind: string; risk?: number }
>;

const client = new ClientPublicMainnet();

export interface WalletCounterparty {
  address: string;
  label: string | null;
  kind: string;
  risk: number;
  interactions: number;
}

export interface WalletSnapshot {
  address: string;
  lock: { codeHash: string; hashType: string; args: string };
  lockLabel: string | null;
  lockKind: string;
  balanceCkb: number;
  liveCells: number;
  partial: boolean;
  transactions: number | null;
  udtAccounts: Array<{
    symbol: string | null;
    amount: string;
    decimals: number;
    typeHash: string;
  }>;
  counterparties: WalletCounterparty[];
  recentTransactions: Array<{ hash: string; date: string | null }>;
  riskScore: number;
  tier: "ok" | "watch" | "warning" | "critical";
  taint: "unknown";
  signals: Array<{
    id: string;
    status: "pass" | "warn" | "fail" | "unknown";
    reason: string;
  }>;
}

interface ExplorerAddress {
  attributes?: {
    balance?: string;
    transactions_count?: string;
    live_cells_count?: string;
    udt_accounts?: Array<{
      symbol?: string | null;
      amount?: string;
      decimal?: string;
      type_hash?: string;
      udt_type?: string;
    }>;
  };
}

async function explorerJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${config.explorerUrl}${path}`, {
      headers: {
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        "user-agent": config.userAgent,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getWalletSnapshot(address: string): Promise<WalletSnapshot> {
  const parsed = await Address.fromString(address, client);
  const lock = {
    codeHash: parsed.script.codeHash,
    hashType: parsed.script.hashType,
    args: parsed.script.args,
  };
  const meta = lockMeta(lock.codeHash);

  const [cells, explorer, txPage] = await Promise.all([
    getCellsByLock(
      {
        code_hash: lock.codeHash,
        hash_type: lock.hashType,
        args: lock.args,
      },
      10,
    ),
    explorerJson<{ data?: ExplorerAddress[] }>(
      `/addresses/${encodeURIComponent(address)}`,
    ),
    explorerJson<{
      data?: Array<{
        attributes?: {
          transaction_hash?: string;
          created_at?: string;
          display_inputs?: Array<{ address_hash?: string }>;
          display_outputs?: Array<{ address_hash?: string }>;
        };
      }>;
    }>(`/address_transactions/${encodeURIComponent(address)}?page=1&page_size=10`),
  ]);

  const attrs = explorer?.data?.[0]?.attributes;
  const balanceFromCells = cells.cells.reduce(
    (acc, c) => acc + BigInt(c.output.capacity),
    0n,
  );
  const balanceCkb =
    cells.cells.length > 0
      ? Number(balanceFromCells) / 1e8
      : Number(attrs?.balance ?? "0") / 1e8;

  const udtAccounts = (attrs?.udt_accounts ?? [])
    .filter((u) => {
      const amount = BigInt(u.amount ?? "0");
      return amount > 0n && ["sudt", "xudt", "xudt_compatible"].includes(String(u.udt_type));
    })
    .map((u) => ({
      symbol: u.symbol ?? null,
      amount: u.amount ?? "0",
      decimals: Number(u.decimal ?? 0),
      typeHash: String(u.type_hash ?? ""),
    }));

  const counterparties = new Map<string, WalletCounterparty>();
  const recentTransactions: Array<{ hash: string; date: string | null }> = [];
  for (const tx of txPage?.data ?? []) {
    const a = tx.attributes;
    if (a?.transaction_hash) {
      recentTransactions.push({
        hash: a.transaction_hash,
        date: a.created_at ? String(a.created_at).slice(0, 10) : null,
      });
    }
    const others = new Set<string>();
    for (const cell of [...(a?.display_inputs ?? []), ...(a?.display_outputs ?? [])]) {
      const addr = cell.address_hash;
      if (addr && addr !== address) others.add(addr);
    }
    for (const addr of others) {
      const label = addressLabels[addr];
      const existing = counterparties.get(addr);
      if (existing) {
        existing.interactions += 1;
      } else {
        counterparties.set(addr, {
          address: addr,
          label: label?.label ?? null,
          kind: label?.kind ?? "unknown",
          risk: label?.risk ?? 0,
          interactions: 1,
        });
      }
    }
  }

  const sortedCounterparties = [...counterparties.values()].sort(
    (a, b) => b.risk - a.risk || b.interactions - a.interactions,
  );
  const incidentExposure = sortedCounterparties.filter(
    (c) => c.kind === "incident" || c.risk >= 50,
  );
  const unlabeled = sortedCounterparties.filter((c) => c.kind === "unknown");

  let riskScore = 0;
  if (meta.kind === "unknown") riskScore += 15;
  else if (meta.kind === "wallet") riskScore += 5;
  if (incidentExposure.length > 0) riskScore += 50;
  if (unlabeled.length > 5) riskScore += 10;
  riskScore = Math.max(0, Math.min(100, riskScore));
  const tier =
    riskScore >= 70
      ? "critical"
      : riskScore >= 50
        ? "warning"
        : riskScore >= 25
          ? "watch"
          : "ok";

  return {
    address,
    lock,
    lockLabel: meta.name,
    lockKind: meta.kind,
    balanceCkb,
    liveCells: cells.cells.length,
    partial: cells.partial,
    transactions: attrs?.transactions_count
      ? Number(attrs.transactions_count)
      : null,
    udtAccounts,
    counterparties: sortedCounterparties.slice(0, 20),
    recentTransactions,
    riskScore,
    tier,
    taint: "unknown",
    signals: [
      {
        id: "lock_label",
        status: meta.kind === "unknown" ? "warn" : "pass",
        reason:
          meta.name != null
            ? `Lock is labelled ${meta.name} (${meta.kind}).`
            : "Lock is not in the local label registry.",
      },
      {
        id: "counterparty_exposure",
        status:
          incidentExposure.length > 0
            ? "fail"
            : sortedCounterparties.length === 0
              ? "unknown"
              : unlabeled.length > 5
                ? "warn"
                : "pass",
        reason:
          incidentExposure.length > 0
            ? `Interacts with ${incidentExposure.length} flagged address(es): ${incidentExposure
                .slice(0, 3)
                .map((c) => c.label ?? c.address)
                .join(", ")}.`
            : sortedCounterparties.length === 0
              ? "No recent counterparties were resolved."
              : `${unlabeled.length} of ${sortedCounterparties.length} recent counterparties are unlabelled.`,
      },
      {
        id: "taint",
        status: "unknown",
        reason:
          "No taint/AML source is integrated; this is labels and counterparty exposure, not a KYC/AML determination.",
      },
    ],
  };
}
