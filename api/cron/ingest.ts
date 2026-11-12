import type { IncomingMessage, ServerResponse } from "node:http";
import { ingestAll } from "../../src/ingest.js";
import { ensureDatabase, publishDatabase } from "../../src/vercel.js";

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    send(res, 401, { error: "unauthorized" });
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    send(res, 503, {
      error: "blob_not_configured",
      message:
        "Set BLOB_READ_WRITE_TOKEN to persist the Vercel cron ingest. Without it, the deployment is read-only.",
    });
    return;
  }

  try {
    await ensureDatabase({ forWrite: true });
    const ingest = await ingestAll();
    const blob = await publishDatabase();
    send(res, 200, {
      ok: true,
      ingest,
      blob: { url: blob.url, pathname: blob.pathname },
    });
  } catch (error) {
    send(res, 500, {
      error: "cron_ingest_failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
