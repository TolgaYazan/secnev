import { createRequire } from "node:module";
import { config } from "./config.js";
import { parseU128LE, getCellsByLock, type RpcScript } from "./ckb/rpc.js";
import { scriptHash } from "./ckb/address.js";
import { getCkbPriceUsd } from "./price.js";

const require = createRequire(import.meta.url);

export interface PoolDef {
  baseSymbol: string;
  baseTypeHash: string;
  baseDecimals: number;
  quote: "CKB" | "xUDT";
  quoteTypeHash?: string;
  quoteDecimals: number;
  quoteUsd?: number;
  poolLock: RpcScript;
  poolAddress: string;
  lpTypeHash?: string;
  poolTypeHash?: string;
  source: string;
}

export interface PoolSnapshot {
  symbol: string;
  source: string;
  poolAddress: string;
  poolTypeHash: string | null;
  baseReserve: string;
  quoteReserve: string;
  baseDecimals: number;
  quoteDecimals: number;
  quote: "CKB" | "xUDT";
  quoteUsd: number | null;
  priceUsd: number | null;
  tvlUsd: number | null;
  depth1pctUsd: number | null;
  lastPoolTxAt: number | null;
  observedAt: number;
  cellCount: number;
  pages: number;
  partial: boolean;
}

const pools = require("../config/pools.json") as Record<string, PoolDef>;

export function poolDef(symbol: string): PoolDef | null {
  return pools[symbol] ?? null;
}

export function allPoolDefs(): Record<string, PoolDef> {
  return pools;
}

export function computePoolMetrics(
  baseAmount: bigint,
  quoteAmount: bigint,
  baseDecimals: number,
  quoteDecimals: number,
  quoteUsd: number | null,
): {
  priceUsd: number | null;
  tvlUsd: number | null;
  depth1pctUsd: number | null;
} {
  if (baseAmount <= 0n || quoteAmount <= 0n) {
    return { priceUsd: null, tvlUsd: null, depth1pctUsd: null };
  }
  const base = Number(baseAmount) / 10 ** baseDecimals;
  const quote = Number(quoteAmount) / 10 ** quoteDecimals;
  const priceUsd =
    quoteUsd != null && base > 0 ? (quote * quoteUsd) / base : null;
  const tvlUsd =
    priceUsd != null && quoteUsd != null
      ? base * priceUsd + quote * quoteUsd
      : null;
  const depth1pctUsd =
    quoteUsd != null ? quote * quoteUsd * (Math.sqrt(1.01) - 1) : null;
  return { priceUsd, tvlUsd, depth1pctUsd };
}

function sameScript(
  type: { code_hash: string; hash_type: string; args: string } | null,
  hash: string | undefined,
): boolean {
  if (!type || !hash) return false;
  try {
    return (
      scriptHash({
        codeHash: type.code_hash,
        hashType: type.hash_type,
        args: type.args,
      }).toLowerCase() === hash.toLowerCase()
    );
  } catch {
    return false;
  }
}

async function getLastPoolTxAt(lpTypeHash: string | undefined): Promise<number | null> {
  if (!lpTypeHash) return null;
  try {
    const res = await fetch(
      `${config.explorerUrl}/udt_transactions/${encodeURIComponent(lpTypeHash)}?page=1&page_size=1`,
      {
        headers: {
          accept: "application/vnd.api+json",
          "content-type": "application/vnd.api+json",
          "user-agent": config.userAgent,
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: Array<{ attributes?: { create_timestamp?: string } }>;
    };
    const raw = json.data?.[0]?.attributes?.create_timestamp;
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Read a constant-product pool directly from its live cells.
 *
 * This deliberately does not use the UTXOSwap backend: the pool lock and the
 * token type hashes are enough to read reserves from CKB. No API key required.
 */
export async function getPoolSnapshot(symbol: string): Promise<PoolSnapshot | null> {
  const def = pools[symbol];
  if (!def) return null;

  try {
    const result = await getCellsByLock(def.poolLock, 5);
    let baseAmount = 0n;
    let quoteAmount = 0n;

    for (const cell of result.cells) {
      const type = cell.output.type;
      if (sameScript(type, def.baseTypeHash)) {
        baseAmount += parseU128LE(cell.output_data);
      } else if (def.quote === "CKB" && !type) {
        quoteAmount += BigInt(cell.output.capacity);
      } else if (def.quote === "xUDT" && sameScript(type, def.quoteTypeHash)) {
        quoteAmount += parseU128LE(cell.output_data);
      }
    }

    if (baseAmount <= 0n || quoteAmount <= 0n) return null;

    const quoteUsd =
      def.quote === "CKB" ? await getCkbPriceUsd() : (def.quoteUsd ?? null);
    const { priceUsd, tvlUsd, depth1pctUsd } = computePoolMetrics(
      baseAmount,
      quoteAmount,
      def.baseDecimals,
      def.quoteDecimals,
      quoteUsd,
    );

    return {
      symbol: def.baseSymbol,
      source: def.source,
      poolAddress: def.poolAddress,
      poolTypeHash: def.poolTypeHash ?? null,
      baseReserve: baseAmount.toString(),
      quoteReserve: quoteAmount.toString(),
      baseDecimals: def.baseDecimals,
      quoteDecimals: def.quoteDecimals,
      quote: def.quote,
      quoteUsd,
      priceUsd,
      tvlUsd,
      depth1pctUsd,
      lastPoolTxAt: await getLastPoolTxAt(def.lpTypeHash),
      observedAt: Date.now(),
      cellCount: result.cells.length,
      pages: result.pages,
      partial: result.partial,
    };
  } catch {
    return null;
  }
}
