import http from "node:http";
import { config } from "./config.js";
import { handleApi, serveStatic } from "./api.js";
import { listAssets } from "./db.js";
import { ingestAll } from "./ingest.js";

const buckets = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  b.count += 1;
  return b.count > 120;
}

async function main() {
  if (listAssets().length === 0) {
    console.log("[secnev] empty database — running first ingest");
    const result = await ingestAll();
    console.log("[secnev] ingest", JSON.stringify(result));
  }

  const server = http.createServer(async (req, res) => {
    const started = Date.now();
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    try {
      if (url.pathname.startsWith("/api/") && limited(ip)) {
        res.writeHead(429, {
          "content-type": "application/json",
          "retry-after": "60",
          "access-control-allow-origin": "*",
        });
        res.end(JSON.stringify({ error: "rate_limited" }));
        return;
      }

      const handled = await handleApi(req, res, url);
      if (handled) return;
      serveStatic(req, res, url);
    } catch (error) {
      console.error("[secnev] request failed", error);
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "internal_error" }));
      }
    } finally {
      if (url.pathname.startsWith("/api/")) {
        console.log(
          `${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`,
        );
      }
    }
  });

  server.listen(config.port, () => {
    console.log(`[secnev] http://localhost:${config.port}`);
    console.log(`[secnev] api  http://localhost:${config.port}/api/v1/assets`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
