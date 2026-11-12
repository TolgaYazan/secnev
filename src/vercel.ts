import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { list, put } from "@vercel/blob";
import { config, ROOT } from "./config.js";

const TEMP_DB = path.join(os.tmpdir(), "secnev.db");
const BUNDLED_DB = path.join(ROOT, "data", "secnev.snapshot.db");
const BLOB_PATH = "secnev.db";

let ready: Promise<void> | null = null;

export function isVercel(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV != null ||
    process.env.NOW_BUILDER != null
  );
}

async function download(url: string, dest: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Blob download HTTP ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Prepare the SQLite database inside a Vercel Function.
 *
 * The deployed snapshot is read-only. If BLOB_READ_WRITE_TOKEN is present,
 * the latest DB is downloaded from Vercel Blob; otherwise the bundled
 * data/secnev.snapshot.db is copied to /tmp. Cron uses forWrite=true.
 */
export async function ensureDatabase(opts: { forWrite?: boolean } = {}): Promise<void> {
  if (!isVercel()) return;
  if (ready && !opts.forWrite && config.readOnly) return ready;

  ready = (async () => {
    fs.rmSync(TEMP_DB, { force: true });
    let downloaded = false;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (token) {
      try {
        const { blobs } = await list({ prefix: BLOB_PATH, limit: 1, token });
        if (blobs[0]?.url) {
          await download(blobs[0].url, TEMP_DB);
          downloaded = true;
        }
      } catch (error) {
        console.error(
          "secnev: blob download failed; falling back to bundled snapshot",
          error,
        );
      }
    }

    if (!downloaded) {
      if (!fs.existsSync(BUNDLED_DB)) {
        throw new Error(
          `No database available. Expected ${BUNDLED_DB} or a Blob at ${BLOB_PATH}.`,
        );
      }
      fs.copyFileSync(BUNDLED_DB, TEMP_DB);
    }

    config.dbPath = TEMP_DB;
    config.readOnly = !opts.forWrite;
  })();

  return ready;
}

/** Persist the current DB to Vercel Blob after a cron ingest. */
export async function publishDatabase(): Promise<{
  url: string;
  pathname: string;
}> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required to persist a Vercel cron ingest.",
    );
  }
  if (config.readOnly) {
    throw new Error("Database is read-only; cron must call ensureDatabase({ forWrite: true }).");
  }
  const { prepareForSnapshot } = await import("./db.js");
  prepareForSnapshot();
  const body = fs.readFileSync(config.dbPath);
  const blob = await put(BLOB_PATH, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/vnd.sqlite3",
    token,
  });
  return { url: blob.url, pathname: blob.pathname };
}
