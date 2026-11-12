import type {
  AssetDef,
  Grade,
  ScoreResult,
  Signal,
  Tier,
} from "./types.js";

export const WEIGHTS: Record<AssetDef["kind"], Record<string, number>> = {
  stablecoin: {
    peg_deviation: 0.15,
    peg_persistence: 0.1,
    cross_venue_spread: 0.05,
    supply_reconciliation: 0.1,
    mint_authority: 0.1,
    redemption_velocity: 0.1,
    liquidity_depth: 0.1,
    holder_concentration: 0.05,
    xudt_extensions: 0.05,
    supply_cap: 0.05,
    incident_history: 0.05,
    admin_change: 0.05,
    script_audit: 0.05,
  },
  vault: {
    withdrawal_availability: 0.2,
    exchange_rate_velocity: 0.1,
    admin_change: 0.1,
    script_audit: 0.1,
    holder_concentration: 0.05,
    supply_reconciliation: 0.05,
    incident_history: 0.1,
    oracle_health: 0.1,
    collateral_health: 0.05,
    mint_authority: 0.05,
    supply_cap: 0.05,
    liquidity_depth: 0.05,
  },
  token: {
    holder_concentration: 0.15,
    mint_authority: 0.2,
    xudt_extensions: 0.1,
    supply_cap: 0.1,
    supply_reconciliation: 0.05,
    liquidity_depth: 0.1,
    deployer_history: 0.05,
    incident_history: 0.05,
    admin_change: 0.05,
    redemption_velocity: 0.05,
    market_integrity: 0.05,
    script_audit: 0.05,
  },
  script: {
    script_audit: 0.25,
    admin_change: 0.25,
    incident_history: 0.2,
    xudt_extensions: 0.1,
    liquidity_depth: 0.1,
    supply_reconciliation: 0.1,
  },
};

const BANDS: Array<[number, Grade]> = [
  [5, "A+"],
  [12, "A"],
  [20, "A-"],
  [28, "B+"],
  [37, "B"],
  [46, "B-"],
  [56, "C+"],
  [66, "C"],
  [77, "C-"],
  [88, "D"],
  [100, "F"],
];

export function gradeFor(score: number): Grade {
  const s = Math.max(0, Math.min(100, score));
  for (const [max, grade] of BANDS) {
    if (s <= max) return grade;
  }
  return "F";
}

export function tierFor(score: number): Tier {
  if (score >= 70) return "critical";
  if (score >= 50) return "warning";
  if (score >= 25) return "watch";
  return "ok";
}

export function scoreAsset(asset: AssetDef, signals: Signal[]): ScoreResult {
  const weights = WEIGHTS[asset.kind];
  const byId = new Map(signals.map((s) => [s.id, s]));
  let weighted = 0;
  let totalWeight = 0;
  const drivers: ScoreResult["drivers"] = [];

  for (const [id, weight] of Object.entries(weights)) {
    const signal = byId.get(id);
    if (!signal || signal.score == null) continue;
    const contribution = signal.score * weight;
    weighted += contribution;
    totalWeight += weight;
    if (contribution > 0) {
      drivers.push({
        id,
        name: signal.name,
        weight,
        score: signal.score,
        contribution,
        status: signal.status,
        reason: signal.reason,
      });
    }
  }

  const known = signals.filter((s) => s.score != null).length;
  const total = signals.length;
  const coverageRatio = total > 0 ? known / total : 0;

  let score =
    totalWeight > 0 ? Math.round(weighted / totalWeight) : 50;
  score = Math.max(0, Math.min(100, score));

  // Hard floors: a catastrophic state cannot be averaged away.
  if (asset.manual?.scoreFloor != null) {
    score = Math.max(score, asset.manual.scoreFloor);
  }
  const incident = byId.get("incident_history");
  if (incident?.status === "fail" && incident.score != null) {
    score = Math.max(score, 85);
  }
  const peg = byId.get("peg_deviation");
  if (peg?.status === "fail") {
    score = Math.max(score, 70);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  let confidence: ScoreResult["confidence"] =
    coverageRatio >= 0.75 ? "high" : coverageRatio >= 0.45 ? "medium" : "low";

  // A material low-confidence warning/failure (e.g. a thin/stale price pool)
  // cannot leave the overall score at high confidence.
  const materialLowConfidence = signals.some(
    (s) =>
      s.confidence === "low" &&
      (s.status === "fail" || s.status === "warn") &&
      (weights[s.id] ?? 0) >= 0.1,
  );
  if (materialLowConfidence && confidence === "high") confidence = "medium";

  drivers.sort((a, b) => b.contribution - a.contribution);

  return {
    score,
    grade: gradeFor(score),
    tier: tierFor(score),
    confidence,
    coverage: { live: known, total },
    drivers,
    signals,
  };
}
