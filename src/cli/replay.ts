import { createRequire } from "node:module";
import { listAssets } from "../db.js";
import { runReplay } from "../replay.js";

const require = createRequire(import.meta.url);
const incidents = require("../../config/incidents.json") as Record<
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

function curated() {
  for (const [symbol, list] of Object.entries(incidents)) {
    for (const incident of list) {
      console.log(`[${incident.date}] ${symbol} — ${incident.category}`);
      console.log(`  mechanism: ${incident.mechanism}`);
      console.log(`  loss: ${incident.loss}`);
      console.log(`  status: ${incident.status}`);
      console.log(`  ${incident.summary}`);
      console.log(`  source: ${incident.links.join(", ")}`);
      console.log("");
    }
  }
}

console.log("secnev incident replay\n");

if (process.env.REPLAY_CURATED === "1") {
  console.log("Mode: curated facts (REPLAY_CURATED=1)\n");
  curated();
} else {
  try {
    const result = await runReplay("dCKB");
    console.log(
      `Mode: real historical transactions — ${result.transactions.toLocaleString()} dCKB txs, ${result.pages} pages, ${result.firstDate} → ${result.lastDate}`,
    );
    console.log(
      `Detailed replay: ${result.detailedTransactions.toLocaleString()} candidate txs since 2026-08-01; net ${result.windowNetHuman.toLocaleString(undefined, { maximumFractionDigits: 2 })} dCKB\n`,
    );
    console.log("Daily dCKB net / gross movement since 2026-08-01 (full transaction detail):");
    for (const event of result.events) {
      console.log(
        `  ${event.date}  net ${event.netHuman.toLocaleString(undefined, { maximumFractionDigits: 2 }).padStart(13)}  gross ${event.grossHuman.toLocaleString(undefined, { maximumFractionDigits: 2 }).padStart(13)} dCKB  ${event.txs} tx${event.txs === 1 ? "" : "s"}${event.largestTx ? `  ${event.largestTx}` : ""}`,
      );
    }
    const burns = [...result.events]
      .filter((e) => e.netHuman < 0)
      .sort((a, b) => a.netHuman - b.netHuman)
      .slice(0, 5);
    if (burns.length) {
      console.log("\nLargest net-burn days:");
      for (const event of burns) {
        console.log(
          `  ${event.date}  ${event.netHuman.toLocaleString(undefined, { maximumFractionDigits: 2 })} dCKB  ${event.largestTx}`,
        );
      }
    }
    const moves = [...result.events]
      .sort((a, b) => b.grossHuman - a.grossHuman)
      .slice(0, 5);
    if (moves.length) {
      console.log("\nLargest movement days (gross dCKB):");
      for (const event of moves) {
        console.log(
          `  ${event.date}  ${event.grossHuman.toLocaleString(undefined, { maximumFractionDigits: 2 })} dCKB  ${event.largestTx}`,
        );
      }
    }
    console.log("\nCurated incident context:");
    curated();
  } catch (error) {
    console.log(
      `Live replay unavailable (${error instanceof Error ? error.message : String(error)}); falling back to curated facts.\n`,
    );
    curated();
  }
}

console.log("Current scores:");
for (const asset of listAssets()) {
  console.log(
    `  ${asset.symbol.padEnd(8)} score=${asset.score ?? "—"} grade=${asset.grade ?? "—"} tier=${asset.tier ?? "—"} coverage=${asset.coverage_live ?? 0}/${asset.coverage_total ?? 0}`,
  );
}
