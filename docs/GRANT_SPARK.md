# Spark Program application — secnev

**Project name:** secnev — CKB-native risk observatory (MVP hardening)

**Applicant:** secnev (independent, CKB-native)

**Request:** **$2,000** equivalent in CKB · **Timeline:** 4 weeks

---

## Problem

CKB has no independent risk layer. Elliptic, Nominis, Bitrace, Merkle Science and MistTrack do not cover CKB; Webacy does not support CKB; DefiLlama has no CKB L1 TVL/stablecoin data. The dCKB drain and the RGB++ forged-proof incident show the cost.

## What exists

A working MVP on CKB mainnet:

- CKB public RPC `get_cells` + CKB Explorer API ingestion;
- cell → holder/lock aggregation, xUDT args parsing;
- 10 assets, 72/105 live signal instances, scores with evidence/coverage;
- live RUSD/USDI/STB/Seal/BTC pool price + liquidity;
- live iCKB exchange rate/backing;
- organic holder concentration with protocol/DEX lock exclusions;
- wallet exposure screen (labels + counterparties);
- real dCKB historical transaction replay;
- full cell scans (Seal: 10,662 cells / 108 pages);
- dashboard, REST API, webhook + Telegram + email alerts, 15 unit tests, public methodology v0.3.

Run: `npm install && npm run ingest && npm run dev` → `http://localhost:8787`.

## What this Spark grant delivers (4 weeks)

1. **Persistent incremental indexer** — full scans already work; add a durable cell cache and incremental cursor/block updates.
2. **15 assets / 15 signals** — add two more xUDT/RGB++ assets and wire the remaining low-cost signals.
3. **Protocol state** — Stable++ CR/TCR/oracle and MoniMkt positions.
4. **Pool discovery** — AGENT/KOI/iCKB pools and a second venue for cross-venue spread.
5. **Public demo + methodology v0.4** — documented, reproducible, in English and Chinese.

Organic holder concentration, five live pools, iCKB exchange rate, wallet exposure, real dCKB replay, full scans and webhook/Telegram/email are already built.

## To-do list

- [ ] Week 1: persistent incremental indexer / cursor cache.
- [ ] Week 2: Stable++/MoniMkt protocol state; AGENT/KOI pool discovery.
- [ ] Week 3: 15 assets / 15 signals; second venue.
- [ ] Week 4: demo, methodology v0.4, tests, write-up.

## Verification

- Public repo with `npm test`, `npm run ingest`, `npm run replay`.
- Dashboard and API reachable locally.
- A short video/GIF of the dCKB replay and the live dashboard.
- Methodology diff published.

## Relevance to CKB

- Uses CKB's cell model directly (not an EVM port).
- Serves CKB issuers, wallets, DEXs and the Eco Fund with free, explainable risk data.
- Public good: Apache-2.0 code, CC BY 4.0 data, no token, no paid scores.
