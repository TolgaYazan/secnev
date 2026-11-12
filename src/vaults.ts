import { createRequire } from "node:module";
import { getCellsByLock, type RpcScript } from "./ckb/rpc.js";
import { getXudtDetail } from "./explorer.js";

const require = createRequire(import.meta.url);

export interface VaultDef {
  kind: "ickb";
  lock: RpcScript;
  tokenTypeHash: string;
  tokenDecimals: number;
  source: string;
  notes?: string;
}

export interface VaultSnapshot {
  symbol: string;
  source: string;
  poolCkb: string;
  poolCkbHuman: number;
  tokenSupply: string;
  tokenSupplyHuman: number;
  exchangeRate: number | null;
  backingRatio: number | null;
  depositCells: number;
  pages: number;
  partial: boolean;
  observedAt: number;
}

const vaults = require("../config/vaults.json") as Record<string, VaultDef>;

export function vaultDef(symbol: string): VaultDef | null {
  return vaults[symbol] ?? null;
}

export function allVaultDefs(): Record<string, VaultDef> {
  return vaults;
}

/**
 * Read an iCKB-style vault directly from its Logic lock.
 *
 * The iCKB Logic lock holds NervosDAO deposits. The exchange rate is
 * CKB deposits / iCKB supply; it rises with DAO interest and falls if the
 * pool loses CKB relative to supply.
 */
export async function getVaultSnapshot(symbol: string): Promise<VaultSnapshot | null> {
  const def = vaults[symbol];
  if (!def) return null;

  try {
    const [cells, detail] = await Promise.all([
      getCellsByLock(def.lock, 50),
      getXudtDetail(def.tokenTypeHash),
    ]);
    if (!detail) return null;
    const supply = BigInt(detail.attributes.total_amount || "0");
    if (supply <= 0n) return null;

    const DAO_CODE_HASH =
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e";
    let poolCkb = 0n;
    for (const cell of cells.cells) {
      // iCKB Logic deposits are NervosDAO cells; sum only DAO-typed cells.
      if (cell.output.type?.code_hash === DAO_CODE_HASH) {
        poolCkb += BigInt(cell.output.capacity);
      }
    }
    if (poolCkb <= 0n) return null;
    const poolCkbHuman = Number(poolCkb) / 1e8;
    const tokenSupplyHuman = Number(supply) / 10 ** def.tokenDecimals;
    const exchangeRate =
      tokenSupplyHuman > 0 ? poolCkbHuman / tokenSupplyHuman : null;
    const backingRatio =
      exchangeRate != null && exchangeRate > 0 ? exchangeRate : null;

    return {
      symbol,
      source: def.source,
      poolCkb: poolCkb.toString(),
      poolCkbHuman,
      tokenSupply: supply.toString(),
      tokenSupplyHuman,
      exchangeRate,
      backingRatio,
      depositCells: cells.cells.length,
      pages: cells.pages,
      partial: cells.partial,
      observedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
