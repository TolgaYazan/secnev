import fs from "node:fs";
import path from "node:path";
import { config, ROOT } from "./config.js";
import {
  getAssetDetail,
  getHistory,
  getStats,
  listAlerts,
  listAssets,
  listIncidents,
} from "./db.js";
import { ingestAll } from "./ingest.js";
import { allPoolDefs } from "./pools.js";
import { allVaultDefs } from "./vaults.js";
import { getWalletSnapshot } from "./wallet.js";
import { WEIGHTS, gradeFor, tierFor } from "./scoring.js";

const PUBLIC_DIR = path.join(ROOT, "public");

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "x-content-type-options": "nosniff",
  });
  res.end(payload);
}

function parseTags(row: Record<string, unknown>) {
  try {
    return {
      ...row,
      tags: JSON.parse(String(row.tags ?? "[]")),
    };
  } catch {
    return { ...row, tags: [] };
  }
}

function methodology() {
  return {
    version: config.methodologyVersion,
    polarity: "0-100, higher = worse",
    grades: [
      { grade: "A+", max: 5 },
      { grade: "A", max: 12 },
      { grade: "A-", max: 20 },
      { grade: "B+", max: 28 },
      { grade: "B", max: 37 },
      { grade: "B-", max: 46 },
      { grade: "C+", max: 56 },
      { grade: "C", max: 66 },
      { grade: "C-", max: 77 },
      { grade: "D", max: 88 },
      { grade: "F", max: 100 },
    ],
    tiers: [
      { tier: "ok", max: 24 },
      { tier: "watch", max: 49 },
      { tier: "warning", max: 69 },
      { tier: "critical", max: 100 },
    ],
    thresholds: config.thresholds,
    weights: WEIGHTS,
    rules: [
      "Unknown signals are excluded from the weighted score and reduce coverage/confidence.",
      "Missing or stale data is unknown, never safe.",
      "Hard floors apply to unbacked assets, active depegs, and incident failures.",
      "Holder concentration is organic: labeled protocol/DEX locks are excluded; an unconfirmed large holder caps the signal at warn.",
      "An empty incident registry is unknown, not evidence of absence.",
      "Peg and liquidity use a live on-chain pool when one is configured; otherwise they are unknown.",
      "Wallet screening is labels + counterparty exposure; taint is unknown until a taint source is integrated.",
      "Every score exposes ranked drivers with evidence.",
    ],
  };
}

export async function handleApi(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  url: URL,
): Promise<boolean> {
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) return false;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-admin-token",
    });
    res.end();
    return true;
  }

  if (pathname === "/api/v1/health" && req.method === "GET") {
    json(res, 200, {
      ok: true,
      service: "secnev",
      version: config.methodologyVersion,
      now: new Date().toISOString(),
    });
    return true;
  }

  if (pathname === "/api/v1/stats" && req.method === "GET") {
    json(res, 200, getStats());
    return true;
  }

  if (pathname === "/api/v1/assets" && req.method === "GET") {
    const rows = listAssets().map((r) => parseTags(r as unknown as Record<string, unknown>));
    json(res, 200, { data: rows, meta: { count: rows.length } });
    return true;
  }

  const assetMatch = pathname.match(/^\/api\/v1\/assets\/([^/]+)$/);
  if (assetMatch && req.method === "GET") {
    const id = decodeURIComponent(assetMatch[1]!);
    const asset = getAssetDetail(id);
    if (!asset) {
      json(res, 404, { error: "asset_not_found", id });
      return true;
    }
    json(res, 200, asset);
    return true;
  }

  const historyMatch = pathname.match(/^\/api\/v1\/assets\/([^/]+)\/history$/);
  if (historyMatch && req.method === "GET") {
    const id = decodeURIComponent(historyMatch[1]!);
    json(res, 200, { data: getHistory(id) });
    return true;
  }

  if (pathname === "/api/v1/alerts" && req.method === "GET") {
    json(res, 200, { data: listAlerts(100) });
    return true;
  }

  if (pathname === "/api/v1/incidents" && req.method === "GET") {
    json(res, 200, { data: listIncidents() });
    return true;
  }

  if (pathname === "/api/v1/methodology" && req.method === "GET") {
    json(res, 200, methodology());
    return true;
  }

  if (pathname === "/api/v1/vaults" && req.method === "GET") {
    json(res, 200, {
      data: Object.entries(allVaultDefs()).map(([symbol, def]) => ({
        symbol,
        source: def.source,
        lock: def.lock,
        tokenTypeHash: def.tokenTypeHash,
        notes: def.notes ?? null,
      })),
    });
    return true;
  }

  const walletMatch = pathname.match(/^\/api\/v1\/wallet\/(.+)$/);
  if (walletMatch && req.method === "GET") {
    const address = decodeURIComponent(walletMatch[1]!);
    try {
      const snapshot = await getWalletSnapshot(address);
      json(res, 200, snapshot);
    } catch (error) {
      json(res, 400, {
        error: "invalid_wallet_address",
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return true;
  }

  if (pathname === "/api/v1/pools" && req.method === "GET") {
    json(res, 200, {
      data: Object.entries(allPoolDefs()).map(([symbol, def]) => ({
        symbol,
        source: def.source,
        poolAddress: def.poolAddress,
        poolTypeHash: def.poolTypeHash ?? null,
        lpTypeHash: def.lpTypeHash ?? null,
        baseTypeHash: def.baseTypeHash,
        quote: def.quote,
      })),
    });
    return true;
  }

  if (pathname === "/api/v1/ingest" && req.method === "POST") {
    if (config.readOnly) {
      json(res, 503, {
        error: "read_only",
        message:
          "This deployment is read-only. Vercel refreshes the snapshot through /api/cron/ingest; run ingestion locally or in the cron job.",
      });
      return true;
    }
    const token =
      req.headers["x-admin-token"] ??
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!config.adminToken || token !== config.adminToken) {
      json(res, 401, { error: "unauthorized" });
      return true;
    }
    const result = await ingestAll();
    json(res, 200, result);
    return true;
  }

  json(res, 404, { error: "not_found", path: pathname });
  return true;
}

export function serveStatic(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  url: URL,
): void {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const file = path.join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file);
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
  };
  res.writeHead(200, {
    "content-type": types[ext] ?? "application/octet-stream",
    "cache-control": ext === ".html" ? "no-cache" : "public, max-age=300",
  });
  fs.createReadStream(file).pipe(res);
}

// Re-exported for tests / docs.
export { gradeFor, tierFor };
