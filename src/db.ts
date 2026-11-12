import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";
import type {
  AssetDef,
  AssetSnapshot,
  ScoreResult,
  Signal,
} from "./types.js";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  if (!config.readOnly) {
    fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  }
  db = new DatabaseSync(config.dbPath, { readOnly: config.readOnly });
  if (config.readOnly) return db;
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      source TEXT NOT NULL,
      type_hash TEXT,
      code_hash TEXT,
      hash_type TEXT,
      args TEXT,
      decimals INTEGER NOT NULL DEFAULT 0,
      issuer TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS snapshots (
      asset_id TEXT NOT NULL,
      ts INTEGER NOT NULL,
      supply TEXT,
      supply_usd REAL,
      price_usd REAL,
      price_source TEXT,
      holders INTEGER,
      cell_count INTEGER,
      top10_share REAL,
      organic_top10_share REAL,
      raw_top10_share REAL,
      exchange_rate REAL,
      vault_backing_ratio REAL,
      vault_pool_ckb TEXT,
      lock_distribution TEXT,
      coverage_live INTEGER,
      coverage_total INTEGER,
      PRIMARY KEY (asset_id, ts)
    );
    CREATE TABLE IF NOT EXISTS scores (
      asset_id TEXT NOT NULL,
      ts INTEGER NOT NULL,
      score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      tier TEXT NOT NULL,
      confidence TEXT NOT NULL,
      coverage_live INTEGER NOT NULL,
      coverage_total INTEGER NOT NULL,
      drivers TEXT NOT NULL,
      signals TEXT NOT NULL,
      methodology_version TEXT NOT NULL,
      peg_status TEXT,
      peg_deviation_pct REAL,
      PRIMARY KEY (asset_id, ts)
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      detector TEXT NOT NULL,
      severity TEXT NOT NULL,
      old_tier TEXT,
      new_tier TEXT,
      why_now TEXT NOT NULL,
      evidence TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      delivery_status TEXT,
      delivery_error TEXT,
      delivered_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS alert_deliveries (
      alert_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (alert_id, channel)
    );
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      asset_symbol TEXT,
      date TEXT,
      category TEXT,
      mechanism TEXT,
      loss TEXT,
      status TEXT,
      summary TEXT,
      links TEXT
    );
    CREATE TABLE IF NOT EXISTS ingest_runs (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      status TEXT NOT NULL,
      stats TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_scores_asset_ts ON scores(asset_id, ts);
    CREATE INDEX IF NOT EXISTS idx_snapshots_asset_ts ON snapshots(asset_id, ts);
    CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
    CREATE INDEX IF NOT EXISTS idx_alert_deliveries_alert ON alert_deliveries(alert_id);
  `);
  // Additive migrations for local databases created before these fields.
  for (const sql of [
    "ALTER TABLE scores ADD COLUMN peg_status TEXT",
    "ALTER TABLE scores ADD COLUMN peg_deviation_pct REAL",
    "ALTER TABLE snapshots ADD COLUMN organic_top10_share REAL",
    "ALTER TABLE snapshots ADD COLUMN raw_top10_share REAL",
    "ALTER TABLE snapshots ADD COLUMN exchange_rate REAL",
    "ALTER TABLE snapshots ADD COLUMN vault_backing_ratio REAL",
    "ALTER TABLE snapshots ADD COLUMN vault_pool_ckb TEXT",
    "ALTER TABLE alerts ADD COLUMN delivery_status TEXT",
    "ALTER TABLE alerts ADD COLUMN delivery_error TEXT",
    "ALTER TABLE alerts ADD COLUMN delivered_at INTEGER",
  ]) {
    try {
      db.exec(sql);
    } catch {
      // column already exists
    }
  }
  return db;
}

/** Flush WAL and switch to a single-file journal for snapshot upload. */
export function prepareForSnapshot(): void {
  const d = getDb();
  d.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  d.exec("PRAGMA journal_mode = DELETE");
}

export function upsertAsset(asset: AssetDef): void {
  const d = getDb();
  d.prepare(`
    INSERT INTO assets (id, symbol, name, kind, source, type_hash, code_hash, hash_type, args, decimals, issuer, tags, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      symbol=excluded.symbol, name=excluded.name, kind=excluded.kind,
      source=excluded.source, type_hash=excluded.type_hash, code_hash=excluded.code_hash,
      hash_type=excluded.hash_type, args=excluded.args, decimals=excluded.decimals,
      issuer=excluded.issuer, tags=excluded.tags, notes=excluded.notes, updated_at=excluded.updated_at
  `).run(
    asset.id,
    asset.symbol,
    asset.name,
    asset.kind,
    asset.source,
    asset.typeHash ?? null,
    asset.codeHash ?? null,
    asset.hashType ?? null,
    asset.args ?? null,
    asset.decimals,
    asset.issuer ?? null,
    JSON.stringify(asset.tags ?? []),
    asset.notes ?? null,
    Date.now(),
  );
}

export function insertSnapshot(snapshot: AssetSnapshot): void {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO snapshots
      (asset_id, ts, supply, supply_usd, price_usd, price_source, holders, cell_count, top10_share, organic_top10_share, raw_top10_share, exchange_rate, vault_backing_ratio, vault_pool_ckb, lock_distribution, coverage_live, coverage_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      snapshot.assetId,
      snapshot.ts,
      snapshot.supply,
      snapshot.supplyUsd,
      snapshot.priceUsd,
      snapshot.priceSource,
      snapshot.holders,
      snapshot.cellCount,
      snapshot.top10Share,
      snapshot.organicTop10Share ?? null,
      snapshot.rawTop10Share ?? null,
      snapshot.exchangeRate ?? null,
      snapshot.vaultBackingRatio ?? null,
      snapshot.vaultPoolCkb ?? null,
      snapshot.lockDistribution ? JSON.stringify(snapshot.lockDistribution) : null,
      snapshot.coverage.live,
      snapshot.coverage.total,
    );
}

export function insertScore(assetId: string, ts: number, result: ScoreResult): void {
  const peg = result.signals.find((s) => s.id === "peg_deviation");
  const pegDev = peg?.evidence?.deviationPct;
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO scores
      (asset_id, ts, score, grade, tier, confidence, coverage_live, coverage_total, drivers, signals, methodology_version, peg_status, peg_deviation_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      assetId,
      ts,
      result.score,
      result.grade,
      result.tier,
      result.confidence,
      result.coverage.live,
      result.coverage.total,
      JSON.stringify(result.drivers),
      JSON.stringify(result.signals),
      config.methodologyVersion,
      peg?.status ?? null,
      typeof pegDev === "number" ? pegDev : null,
    );
}

export function getLatestScore(assetId: string): {
  ts: number;
  score: number;
  grade: string;
  tier: string;
  confidence: string;
  coverage_live: number;
  coverage_total: number;
  drivers: ScoreResult["drivers"];
  signals: Signal[];
  peg_status: string | null;
  peg_deviation_pct: number | null;
} | null {
  const row = getDb()
    .prepare(
      `SELECT * FROM scores WHERE asset_id = ? ORDER BY ts DESC LIMIT 1`,
    )
    .get(assetId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ts: Number(row.ts),
    score: Number(row.score),
    grade: String(row.grade),
    tier: String(row.tier),
    confidence: String(row.confidence),
    coverage_live: Number(row.coverage_live),
    coverage_total: Number(row.coverage_total),
    drivers: JSON.parse(String(row.drivers)) as ScoreResult["drivers"],
    signals: JSON.parse(String(row.signals)) as Signal[],
    peg_status: row.peg_status == null ? null : String(row.peg_status),
    peg_deviation_pct:
      row.peg_deviation_pct == null ? null : Number(row.peg_deviation_pct),
  };
}

export function getPreviousState(assetId: string): {
  snapshot?: {
    ts: number;
    supply: string | null;
    priceUsd: number | null;
    exchangeRate: number | null;
  };
  signals?: Signal[];
  score?: { ts: number; score: number; tier: string };
} {
  const snap = getDb()
    .prepare(
      `SELECT ts, supply, price_usd, exchange_rate FROM snapshots WHERE asset_id = ? ORDER BY ts DESC LIMIT 1`,
    )
    .get(assetId) as Record<string, unknown> | undefined;
  const score = getLatestScore(assetId);
  return {
    snapshot: snap
      ? {
          ts: Number(snap.ts),
          supply: snap.supply == null ? null : String(snap.supply),
          priceUsd: snap.price_usd == null ? null : Number(snap.price_usd),
          exchangeRate:
            snap.exchange_rate == null ? null : Number(snap.exchange_rate),
        }
      : undefined,
    signals: score?.signals,
    score: score
      ? { ts: score.ts, score: score.score, tier: score.tier }
      : undefined,
  };
}

export interface AssetListRow {
  id: string;
  symbol: string;
  name: string;
  kind: string;
  source: string;
  type_hash: string | null;
  decimals: number;
  issuer: string | null;
  tags: string;
  notes: string | null;
  score: number | null;
  grade: string | null;
  tier: string | null;
  confidence: string | null;
  coverage_live: number | null;
  coverage_total: number | null;
  scored_at: number | null;
  peg_status: string | null;
  peg_deviation_pct: number | null;
  supply: string | null;
  supply_usd: number | null;
  price_usd: number | null;
  price_source: string | null;
  holders: number | null;
  top10_share: number | null;
  organic_top10_share: number | null;
  raw_top10_share: number | null;
}

export function listAssets(): AssetListRow[] {
  return getDb()
    .prepare(`
      SELECT a.*,
        s.score, s.grade, s.tier, s.confidence, s.coverage_live, s.coverage_total, s.ts AS scored_at,
        s.peg_status, s.peg_deviation_pct,
        sn.supply, sn.supply_usd, sn.price_usd, sn.price_source, sn.holders,
        sn.top10_share, sn.organic_top10_share, sn.raw_top10_share
      FROM assets a
      LEFT JOIN scores s ON s.asset_id = a.id AND s.ts = (SELECT MAX(ts) FROM scores WHERE asset_id = a.id)
      LEFT JOIN snapshots sn ON sn.asset_id = a.id AND sn.ts = (SELECT MAX(ts) FROM snapshots WHERE asset_id = a.id)
      ORDER BY (s.score IS NULL), s.score DESC, a.symbol ASC
    `)
    .all() as unknown as AssetListRow[];
}

export function getAssetDetail(id: string) {
  const asset = getDb()
    .prepare(`SELECT * FROM assets WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!asset) return null;
  const score = getLatestScore(id);
  const snapshot = getDb()
    .prepare(`SELECT * FROM snapshots WHERE asset_id = ? ORDER BY ts DESC LIMIT 1`)
    .get(id) as Record<string, unknown> | undefined;
  const history = getDb()
    .prepare(
      `SELECT ts, score, grade, tier FROM scores WHERE asset_id = ? ORDER BY ts ASC LIMIT 200`,
    )
    .all(id) as unknown as Array<Record<string, unknown>>;
  return {
    ...asset,
    tags: JSON.parse(String(asset.tags)) as string[],
    score,
    snapshot: snapshot
      ? {
          ...snapshot,
          lock_distribution: snapshot.lock_distribution
            ? JSON.parse(String(snapshot.lock_distribution))
            : null,
        }
      : null,
    history,
  };
}

export function getHistory(id: string, limit = 200) {
  return getDb()
    .prepare(
      `SELECT ts, score, grade, tier, confidence, coverage_live, coverage_total
       FROM scores WHERE asset_id = ? ORDER BY ts DESC LIMIT ?`,
    )
    .all(id, limit);
}

export interface AlertInput {
  id: string;
  assetId: string;
  assetSymbol: string;
  detector: string;
  severity: string;
  oldTier: string | null;
  newTier: string | null;
  whyNow: string;
  evidence: Record<string, unknown>;
  createdAt: number;
}

export function insertAlert(alert: AlertInput): void {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO alerts
      (id, asset_id, asset_symbol, detector, severity, old_tier, new_tier, why_now, evidence, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      alert.id,
      alert.assetId,
      alert.assetSymbol,
      alert.detector,
      alert.severity,
      alert.oldTier,
      alert.newTier,
      alert.whyNow,
      JSON.stringify(alert.evidence),
      alert.createdAt,
    );
}

export function recordDelivery(
  alertId: string,
  channel: string,
  status: "delivered" | "failed" | "not_configured",
  error: string | null,
  attempts = 0,
): void {
  getDb()
    .prepare(`
      INSERT INTO alert_deliveries (alert_id, channel, status, error, attempts, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(alert_id, channel) DO UPDATE SET
        status=excluded.status, error=excluded.error,
        attempts=excluded.attempts, updated_at=excluded.updated_at
    `)
    .run(alertId, channel, status, error, attempts, Date.now());
}

export function markAlertDelivery(
  id: string,
  status: "delivered" | "failed" | "not_configured",
  error: string | null,
  attempts = 0,
): void {
  getDb()
    .prepare(
      `UPDATE alerts SET delivery_status = ?, delivery_error = ?, delivered_at = ? WHERE id = ?`,
    )
    .run(status, error, status === "delivered" ? Date.now() : null, id);
  recordDelivery(id, "webhook", status, error, attempts);
}

export function listAlerts(limit = 100) {
  const d = getDb();
  const rows = d
    .prepare(`SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as unknown as Array<Record<string, unknown>>;
  if (rows.length === 0) return [];
  const ids = rows.map((r) => String(r.id));
  const placeholders = ids.map(() => "?").join(",");
  const deliveries = d
    .prepare(
      `SELECT * FROM alert_deliveries WHERE alert_id IN (${placeholders})`,
    )
    .all(...ids) as unknown as Array<Record<string, unknown>>;
  const byAlert = new Map<string, Array<Record<string, unknown>>>();
  for (const delivery of deliveries) {
    const key = String(delivery.alert_id);
    const list = byAlert.get(key) ?? [];
    list.push(delivery);
    byAlert.set(key, list);
  }
  return rows.map((r) => ({
    ...r,
    evidence: JSON.parse(String(r.evidence)),
    deliveries: byAlert.get(String(r.id)) ?? [],
  }));
}

export function seedIncidents(
  data: Record<
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
  >,
): void {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO incidents (id, asset_symbol, date, category, mechanism, loss, status, summary, links)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [symbol, list] of Object.entries(data)) {
    for (const i of list) {
      stmt.run(
        i.id,
        symbol,
        i.date,
        i.category,
        i.mechanism,
        i.loss,
        i.status,
        i.summary,
        JSON.stringify(i.links),
      );
    }
  }
}

export function listIncidents() {
  const rows = getDb()
    .prepare(`SELECT * FROM incidents ORDER BY date DESC`)
    .all() as unknown as Array<Record<string, unknown>>;
  return rows.map((r) => ({ ...r, links: JSON.parse(String(r.links)) }));
}

export function startIngestRun(id: string): void {
  getDb()
    .prepare(
      `INSERT INTO ingest_runs (id, started_at, status) VALUES (?, ?, 'running')`,
    )
    .run(id, Date.now());
}

export function finishIngestRun(
  id: string,
  status: string,
  stats: unknown,
): void {
  getDb()
    .prepare(
      `UPDATE ingest_runs SET finished_at = ?, status = ?, stats = ? WHERE id = ?`,
    )
    .run(Date.now(), status, JSON.stringify(stats), id);
}

export function getStats() {
  const d = getDb();
  const assets = d.prepare(`SELECT COUNT(*) AS n FROM assets`).get() as {
    n: number;
  };
  const scored = d
    .prepare(`SELECT COUNT(DISTINCT asset_id) AS n FROM scores`)
    .get() as { n: number };
  const alerts = d
    .prepare(
      `SELECT COUNT(*) AS n FROM alerts WHERE created_at > ?`,
    )
    .get(Date.now() - 7 * 24 * 3600_000) as { n: number };
  const delivered = d
    .prepare(
      `SELECT COUNT(DISTINCT a.id) AS n
       FROM alerts a
       LEFT JOIN alert_deliveries ad ON ad.alert_id = a.id AND ad.status = 'delivered'
       WHERE a.created_at > ? AND (a.delivery_status = 'delivered' OR ad.alert_id IS NOT NULL)`,
    )
    .get(Date.now() - 7 * 24 * 3600_000) as { n: number };
  const last = d
    .prepare(
      `SELECT * FROM ingest_runs ORDER BY started_at DESC LIMIT 1`,
    )
    .get() as Record<string, unknown> | undefined;
  return {
    assets: Number(assets.n),
    scored: Number(scored.n),
    alerts7d: Number(alerts.n),
    alertsDelivered7d: Number(delivered.n),
    lastIngest: last
      ? {
          id: String(last.id),
          started_at: Number(last.started_at),
          finished_at: last.finished_at ? Number(last.finished_at) : null,
          status: String(last.status),
          stats: last.stats ? JSON.parse(String(last.stats)) : null,
        }
      : null,
  };
}
