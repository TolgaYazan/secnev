import { createRequire } from "node:module";
import type { AssetDef } from "./types.js";

const require = createRequire(import.meta.url);
const seed = require("../config/assets.seed.json") as SeedAsset[];

interface SeedAsset {
  symbol: string;
  name: string;
  typeHash: string;
  typeScript: { args: string; code_hash: string; hash_type: string };
  decimals: number;
  issuer: string | null;
  tags: string[];
  createdAt: string;
}

const seedBySymbol = new Map<string, SeedAsset>(
  (seed as SeedAsset[]).map((a) => [a.symbol, a]),
);

function fromSeed(
  symbol: string,
  kind: AssetDef["kind"],
  extra: Partial<AssetDef> = {},
): AssetDef {
  const a = seedBySymbol.get(symbol);
  if (!a) throw new Error(`Seed asset not found: ${symbol}`);
  return {
    id: `ckb:${kind}:${a.typeHash}`,
    symbol: a.symbol,
    name: a.name || a.symbol,
    kind,
    source: "explorer",
    typeHash: a.typeHash,
    codeHash: a.typeScript.code_hash,
    hashType: a.typeScript.hash_type,
    args: a.typeScript.args,
    decimals: a.decimals,
    issuer: a.issuer,
    tags: a.tags,
    ...extra,
  };
}

export const registry: AssetDef[] = [
  fromSeed("RUSD", "stablecoin", {
    name: "RUSD (Stable++)",
    notes:
      "Stable++ over-collateralized stablecoin. Peg and liquidity are read from the live UTXOSwap RUSD/CKB pool cell.",
  }),
  fromSeed("iCKB", "vault", {
    notes:
      "Liquid NervosDAO vault token. No admin keys; immutable scripts; ScaleBit audit 2024 + executable review 2026.",
  }),
  fromSeed("USDI", "stablecoin", {
    notes:
      "Interstellar Payment Network stablecoin (RGB++). Peg source not yet integrated.",
  }),
  fromSeed("STB", "token", {
    notes: "Stable++ secondary/governance token.",
  }),
  fromSeed("Seal", "token", {
    notes: "RGB++ asset secured by Bitcoin; large holder base.",
  }),
  fromSeed("AGENT", "token", {
    notes: "AI Agent Token; small holder base.",
  }),
  fromSeed("KOI", "token", {
    notes: "StableKoi sUDT (legacy sUDT standard).",
  }),
  fromSeed("BTC", "token", {
    notes: "ccBTC — custodially wrapped BTC on CKB (upstream custody trust remains).",
  }),
  {
    id: "ckb:vault:dckb",
    symbol: "dCKB",
    name: "dCKB (legacy NexisDAO receipt)",
    kind: "vault",
    source: "manual",
    decimals: 8,
    tags: ["legacy", "unbacked", "incident"],
    notes:
      "Legacy NervosDAO receipt token. Deposits were drained in Aug–Oct 2026; dCKB is unbacked. Kept as a graveyard/incident asset.",
    manual: {
      scoreFloor: 95,
      status: "unbacked",
      reason:
        "NervosDAO deposits behind dCKB were drained; 11.71M CKB out with only 600 dCKB burned, then the remaining 196 deposits (12.89M CKB + interest) were claimed and cashed out. dCKB is unbacked.",
      links: [
        "https://talk.nervos.org/t/dckb-post-post-mortem-now-the-funds-are-gone/11016",
      ],
    },
  },
  {
    id: "ckb:vault:monimkt",
    symbol: "MoniMkt",
    name: "MoniMkt (testnet lending market)",
    kind: "vault",
    source: "manual",
    decimals: 0,
    tags: ["testnet", "lending"],
    notes:
      "Native CKB lending market (RUSD base, CKB collateral) currently on Pudge testnet. Not scored on mainnet data yet; shown as a labelled testnet asset.",
    manual: {
      scoreFloor: 50,
      status: "testnet",
      reason:
        "Testnet deployment; mainnet would require an independent audit. No mainnet TVL or positions to score.",
      links: [
        "https://talk.nervos.org/t/spark-program-monimkt-hardening-and-beta-for-a-native-ckb-lending-market/11152",
      ],
    },
  },
];

export function getAsset(id: string): AssetDef | undefined {
  return registry.find((a) => a.id === id);
}

export function explorerAssets(): AssetDef[] {
  return registry.filter((a) => a.source === "explorer");
}
