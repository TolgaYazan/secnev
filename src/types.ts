export type AssetKind = "stablecoin" | "vault" | "token" | "script";

export type SignalStatus = "pass" | "warn" | "fail" | "unknown";

export type Tier = "ok" | "watch" | "warning" | "critical";

export type Grade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D"
  | "F";

export interface AssetDef {
  id: string;
  symbol: string;
  name: string;
  kind: AssetKind;
  source: "explorer" | "manual";
  typeHash?: string;
  codeHash?: string;
  hashType?: string;
  args?: string;
  decimals: number;
  issuer?: string | null;
  tags: string[];
  coingeckoId?: string;
  notes?: string;
  manual?: {
    scoreFloor?: number;
    status: "unbacked" | "testnet" | "deprecated" | "active";
    reason: string;
    links: string[];
  };
}

export interface CellSummary {
  totalAmount: bigint;
  cellCount: number;
  holderCount: number;
  holders: Array<{
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
    share: number;
    cells: number;
  }>;
  lockDistribution: Array<{
    codeHash: string;
    name: string | null;
    holders: number;
    share: number;
  }>;
  partial: boolean;
  pages: number;
}

export interface Signal {
  id: string;
  name: string;
  status: SignalStatus;
  score: number | null;
  confidence: "high" | "medium" | "low";
  evidence: Record<string, unknown>;
  reason: string;
}

export interface ScoreResult {
  score: number;
  grade: Grade;
  tier: Tier;
  confidence: "high" | "medium" | "low";
  coverage: { live: number; total: number };
  drivers: Array<{
    id: string;
    name: string;
    weight: number;
    score: number;
    contribution: number;
    status: SignalStatus;
    reason: string;
  }>;
  signals: Signal[];
}

export interface AssetSnapshot {
  assetId: string;
  ts: number;
  supply: string | null;
  supplyUsd: number | null;
  priceUsd: number | null;
  priceSource: string | null;
  holders: number | null;
  cellCount: number | null;
  top10Share: number | null;
  organicTop10Share?: number | null;
  rawTop10Share?: number | null;
  exchangeRate?: number | null;
  vaultBackingRatio?: number | null;
  vaultPoolCkb?: string | null;
  lockDistribution: CellSummary["lockDistribution"] | null;
  coverage: { live: number; total: number };
}
