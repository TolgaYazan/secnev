import fs from "node:fs";
import path from "node:path";
import { config, ROOT } from "./config.js";
import type { PoolSnapshot } from "./pools.js";

interface ManualPrice {
  priceUsd: number;
  source: string;
  asOf: string;
}

let priceCache: { at: number; value: number | null } | null = null;
const CACHE_MS = 5 * 60_000;

export async function getCkbPriceUsd(): Promise<number | null> {
  if (priceCache && Date.now() - priceCache.at < CACHE_MS) {
    return priceCache.value;
  }
  try {
    const res = await fetch(
      `${config.coingeckoUrl}/simple/price?ids=nervos-network&vs_currencies=usd`,
      { headers: { "user-agent": config.userAgent } },
    );
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as {
      "nervos-network"?: { usd?: number };
    };
    const value = json["nervos-network"]?.usd ?? null;
    priceCache = { at: Date.now(), value };
    return value;
  } catch {
    priceCache = { at: Date.now(), value: null };
    return null;
  }
}

function readManualPrices(): Record<string, ManualPrice> {
  const file = path.join(ROOT, "config", "prices.json");
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      ManualPrice
    >;
  } catch {
    return {};
  }
}

/**
 * Price sources, in order:
 *   1. config/prices.json (manual, timestamped, sourced)
 *   2. CoinGecko id (if configured)
 *   3. A live on-chain pool snapshot (no API key)
 *   4. UTXOSwap pool API (if UTXOSWAP_API_KEY is set)
 * Anything else is unknown. We never invent a price.
 */
export async function getAssetPriceUsd(
  asset: {
    symbol: string;
    typeHash?: string;
    coingeckoId?: string;
  },
  pool?: PoolSnapshot | null,
): Promise<{ priceUsd: number | null; source: string | null }> {
  const manual = readManualPrices()[asset.symbol];
  if (manual && Number.isFinite(manual.priceUsd) && manual.priceUsd > 0) {
    return { priceUsd: manual.priceUsd, source: `manual:${manual.source}` };
  }

  if (asset.coingeckoId) {
    try {
      const res = await fetch(
        `${config.coingeckoUrl}/simple/price?ids=${encodeURIComponent(
          asset.coingeckoId,
        )}&vs_currencies=usd`,
        { headers: { "user-agent": config.userAgent } },
      );
      if (res.ok) {
        const json = (await res.json()) as Record<string, { usd?: number }>;
        const p = json[asset.coingeckoId]?.usd;
        if (typeof p === "number" && p > 0) {
          return { priceUsd: p, source: "coingecko" };
        }
      }
    } catch {
      // fall through
    }
  }

  if (pool?.priceUsd != null) {
    return { priceUsd: pool.priceUsd, source: pool.source };
  }

  if (config.utxoswapApiKey && asset.typeHash) {
    try {
      const res = await fetch(
        "https://utxoswap.xyz/utxo-swap/api/v1/sequencer/pools",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": config.utxoswapApiKey,
            "user-agent": config.userAgent,
          },
          body: JSON.stringify({
            pageNo: 0,
            pageSize: 20,
            searchKey: asset.typeHash,
            sort: "desc",
            orderBy: "tvl",
          }),
        },
      );
      if (res.ok) {
        const json = (await res.json()) as {
          data?: {
            list?: Array<{
              assetX?: { typeHash?: string; price?: string };
              assetY?: { typeHash?: string; price?: string };
            }>;
          };
        };
        for (const pool of json.data?.list ?? []) {
          for (const side of [pool.assetX, pool.assetY]) {
            if (
              side?.typeHash?.toLowerCase() === asset.typeHash.toLowerCase() &&
              side.price
            ) {
              const p = Number(side.price);
              if (Number.isFinite(p) && p > 0) {
                return { priceUsd: p, source: "utxoswap" };
              }
            }
          }
        }
      }
    } catch {
      // fall through
    }
  }

  return { priceUsd: null, source: null };
}
