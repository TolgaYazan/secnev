import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config, ROOT } from "../config.js";

const source = config.dbPath;
const target = path.join(ROOT, "data", "secnev.snapshot.db");

if (!fs.existsSync(source)) {
  console.error(`Source database not found: ${source}`);
  process.exit(1);
}

for (const file of [target, `${target}-wal`, `${target}-shm`]) {
  fs.rmSync(file, { force: true });
}

const db = new DatabaseSync(source);
db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
const escaped = target.replaceAll("'", "''");
db.exec(`VACUUM INTO '${escaped}'`);
db.close();

const snapshot = new DatabaseSync(target);
snapshot.exec("PRAGMA journal_mode = DELETE");
snapshot.close();

const size = fs.statSync(target).size;
console.log(
  `Wrote ${target} (${(size / 1024 / 1024).toFixed(2)} MB, journal_mode=DELETE)`,
);
