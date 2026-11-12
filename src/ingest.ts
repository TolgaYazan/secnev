import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { config } from "./config.js";
import { registry } from "./registry.js";
import {
  finishIngestRun,
  getPreviousState,
  insertAlert,
  insertScore,
  insertSnapshot,
  seedIncidents,
  startIngestRun,
  upsertAsset,
} from "./db.js";
import { getXudtDetail } from "./explorer.js";
import { getCellsByType, summarizeCells } from "./ckb/rpc.js";
import { getAssetPriceUsd } from "./price.js";
import { getPoolSnapshot, type PoolSnapshot } from "./pools.js";
import { getVaultSnapshot, type VaultSnapshot } from "./vaults.js";
import { runDetectors } from "./detectors.js";
import { scoreAsset } from "./scoring.js";
import { deliverAlert } from "./webhook.js";
import type { AssetDef, CellSummary, Signal } from "./types.js";
import type { ExplorerUdt } from "./explorer.js";

const require = createRequire(import.meta.url);
const incidents = require("../config/incidents.json") as Record<
  string,
  Array<{
    id: string;
    date: string;
    category: string;
    mechanism: string;
    loss: string;
    status: string;
    summary: string;
    links: string[];
  }>
>;

const EMPTY_CELLS: CellSummary = {
  totalAmount: 0n,
  cellCount: 0,
  holderCount: 0,
  holders: [],
  lockDistribution: [],
  partial: false,
  pages: 0,
};

function manualSignals(asset: AssetDef): Signal[] {
  const signals: Signal[] = [];
  if (!asset.manual) return signals;

  signals.push({
    id: "manual_status",
    name: "Manual status",
    status: asset.manual.status === "unbacked" ? "fail" : "warn",
    score: asset.manual.status === "unbacked" ? 100 : 50,
    confidence: "high",
    evidence: asset.manual,
    reason: asset.manual.reason,
  });

  if (asset.manual.status === "unbacked") {
    signals.push({
      id: "incident_history",
      name: "Incident history",
      status: "fail",
      score: 100,
      confidence: "high",
      evidence: { incidents: incidents[asset.symbol] ?? [] },
      reason: asset.manual.reason,
    });
    signals.push({
      id: "withdrawal_availability",
      name: "Withdrawal availability",
      status: "fail",
      score: 100,
      confidence: "high",
      evidence: { status: "unbacked" },
      reason: "The asset is unbacked; withdrawals cannot be honoured at par.",
    });
  } else {
    signals.push({
      id: "incident_history",
      name: "Incident history",
      status: "unknown",
      score: null,
      confidence: "low",
      evidence: { incidents: incidents[asset.symbol] ?? [] },
      reason:
        "No incident record in the local registry; this is not evidence of absence.",
    });
  }
  return signals;
}

export interface IngestResult {
  id: string;
  assets: number;
  ok: number;
  failed: number;
  alerts: number;
  errors: Array<{ asset: string; error: string }>;
}

export async function ingestAll(): Promise<IngestResult> {
  const runId = randomUUID();
  startIngestRun(runId);
  seedIncidents(incidents);
  let ok = 0;
  let failed = 0;
  let alerts = 0;
  const errors: Array<{ asset: string; error: string }> = [];

  const emitAlert = async (alert: Parameters<typeof insertAlert>[0]) => {
    insertAlert(alert);
    await deliverAlert(alert);
    alerts += 1;
  };

  for (const asset of registry) {
    try {
      const now = Date.now();
      upsertAsset(asset);

      let cells = EMPTY_CELLS;
      let supply = 0n;
      let priceUsd: number | null = null;
      let priceSource: string | null = null;
      let explorerSupply: string | null = null;
      let explorerDetail: ExplorerUdt | null = null;
      let pool: PoolSnapshot | null = null;
      let vault: VaultSnapshot | null = null;

      if (asset.source === "explorer" && asset.typeHash) {
        explorerDetail = await getXudtDetail(asset.typeHash);
        if (explorerDetail) {
          explorerSupply = explorerDetail.attributes.total_amount;
        }
        if (asset.codeHash && asset.hashType && asset.args) {
          const result = await getCellsByType(
            {
              code_hash: asset.codeHash,
              hash_type: asset.hashType,
              args: asset.args,
            },
            config.maxCellPages,
          );
          cells = summarizeCells(
            result.cells,
            undefined,
            result.partial,
            result.pages,
          );
          supply = cells.totalAmount;
        }
        // If the cell scan was capped, use the Explorer-reported total for
        // supply/USD so a partial scan never understates the asset.
        if ((supply === 0n || cells.partial) && explorerSupply) {
          supply = BigInt(explorerSupply);
        }
        pool = await getPoolSnapshot(asset.symbol);
        vault =
          asset.symbol === "iCKB"
            ? await getVaultSnapshot(asset.symbol)
            : null;
        // Pool-derived prices are used for stablecoin pegs. For tokens, a thin
        // pool price is still published as liquidity evidence, but it is not
        // used to value supply in USD.
        const p = await getAssetPriceUsd(
          asset,
          asset.kind === "stablecoin" ? pool : null,
        );
        priceUsd = p.priceUsd;
        priceSource = p.source;
      }

      const previous = getPreviousState(asset.id);
      const signals =
        asset.source === "manual"
          ? manualSignals(asset)
          : runDetectors({
              asset,
              explorer: explorerDetail,
              cells,
              supply,
              priceUsd,
              priceSource,
              pool,
              vault,
              previous,
              now,
            });

      const result = scoreAsset(asset, signals);
      const holderSignal = result.signals.find(
        (s) => s.id === "holder_concentration",
      );
      const organicTop10Share =
        typeof holderSignal?.evidence?.organicTop10Share === "number"
          ? holderSignal.evidence.organicTop10Share
          : null;
      const rawTop10Share =
        typeof holderSignal?.evidence?.rawTop10Share === "number"
          ? holderSignal.evidence.rawTop10Share
          : cells.holderCount >= 5
            ? cells.holders.slice(0, 10).reduce((acc, h) => acc + h.share, 0)
            : null;
      const top10Share = organicTop10Share ?? rawTop10Share;
      const supplyNumber = Number(supply);
      const supplyUsd =
        priceUsd != null && asset.decimals >= 0
          ? (supplyNumber / 10 ** asset.decimals) * priceUsd
          : null;

      insertSnapshot({
        assetId: asset.id,
        ts: now,
        supply: supply > 0n ? supply.toString() : null,
        supplyUsd,
        priceUsd,
        priceSource,
        holders: cells.holderCount || null,
        cellCount: cells.cellCount || null,
        top10Share,
        organicTop10Share,
        rawTop10Share,
        exchangeRate: vault?.exchangeRate ?? null,
        vaultBackingRatio: vault?.backingRatio ?? null,
        vaultPoolCkb: vault?.poolCkb ?? null,
        lockDistribution: cells.lockDistribution,
        coverage: result.coverage,
      });
      insertScore(asset.id, now, result);

      const prev = previous.score;
      if (prev) {
        if (prev.tier !== result.tier) {
          await emitAlert({
            id: `${asset.id}:${now}:tier`,
            assetId: asset.id,
            assetSymbol: asset.symbol,
            detector: "tier_change",
            severity: result.tier,
            oldTier: prev.tier,
            newTier: result.tier,
            whyNow:
              result.drivers[0]?.reason ??
              `Risk tier changed from ${prev.tier} to ${result.tier}.`,
            evidence: {
              previousScore: prev.score,
              currentScore: result.score,
              drivers: result.drivers.slice(0, 3),
            },
            createdAt: now,
          });
        } else if (result.score - prev.score >= 20) {
          await emitAlert({
            id: `${asset.id}:${now}:jump`,
            assetId: asset.id,
            assetSymbol: asset.symbol,
            detector: "score_jump",
            severity: result.tier,
            oldTier: prev.tier,
            newTier: result.tier,
            whyNow:
              result.drivers[0]?.reason ??
              `Score jumped ${result.score - prev.score} points.`,
            evidence: {
              previousScore: prev.score,
              currentScore: result.score,
              drivers: result.drivers.slice(0, 3),
            },
            createdAt: now,
          });
        }
      }

      ok += 1;
    } catch (error) {
      failed += 1;
      errors.push({
        asset: asset.symbol,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const result: IngestResult = {
    id: runId,
    assets: registry.length,
    ok,
    failed,
    alerts,
    errors,
  };
  finishIngestRun(runId, failed === 0 ? "success" : "partial", result);
  return result;
}
