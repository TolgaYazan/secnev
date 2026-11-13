# secnev — Grant Proposal

**Phase 1: from working MVP to the full CKB risk observatory**

- Applicant: **secnev** (independent, CKB-native)
- Request: **$36,000** equivalent in CKB, staged by milestone
- Duration: **18 weeks**
- Repo: this repository · Demo: `http://localhost:8787` after `npm install && npm run ingest && npm run dev`
- Category: CKB infrastructure / public good / risk intelligence
- License: Apache-2.0 (code), CC BY 4.0 (data)

---

## 1. One-line summary

secnev is an open, CKB-native risk observatory: it scores stablecoins, vaults, xUDT/RGB++ tokens, scripts and wallets from cell-level data, publishes the evidence, and alerts the ecosystem before losses. The MVP is already working on CKB mainnet. This grant funds the full product: protocol-state adapters, the remaining detectors, wallet screening, alerts/webhooks, an incident registry, and the public reports — all free and open.

---

## 2. Why CKB needs this

CKB has real assets but no independent risk layer:

- **No vendor coverage.** Elliptic's public coverage table lists `Nervos: No`; Nominis, Bitrace, Merkle Science and SlowMist MistTrack do not list CKB; Webacy supports 13 chains and CKB is not one of them.
- **No external data.** DefiLlama has no CKB L1 TVL or stablecoin data (only deprecated Godwoken at $0).
- **Losses are learned from forum posts.** The dCKB drain (~24.6M CKB; deposits drained in Aug–Oct 2026, dCKB now unbacked) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days, per the ckb-adversary proposal) are the clearest examples.
- **The only direct attempt stalled.** Quantir's 2026 CKB grant proposal asked for $30k but never produced a public CKB prototype; it failed the DAO's 30-like discussion gate (17 likes) and died in May 2026.

The gap is not a lack of data. It is a lack of **CKB-native interpretation** of cells, lock/type scripts, xUDT args, DAO/vault state, oracles and bridges.

---

## 3. What already exists (built before this grant)

The MVP is not a slide deck. It runs on CKB mainnet today:

| Capability | Status |
|---|---|
| CKB public RPC ingestion (`get_cells`) | Live |
| CKB Explorer API enrichment | Live |
| Cell → holder/lock aggregation | Live (u128 LE amounts, lock keys, known lock labels) |
| xUDT args parser (owner lock, flags, extensions) | Live |
| 10 assets | RUSD, iCKB, USDI, STB, Seal, AGENT, KOI, ccBTC, dCKB (incident), MoniMkt (testnet) |
| 12–14 signal definitions per entity | **72/105 live instances; 33 unknown**, with coverage disclosure |
| Stablecoin price + liquidity | **Live UTXOSwap pool cells** for RUSD/CKB and USDI/CKB (no API key): price, TVL, 1%-impact depth, last-pool-tx age |
| Token liquidity | **Live UTXOSwap pool cells** for STB/CKB, Seal/CKB, BTC/CKB |
| iCKB vault state | **Live exchange rate + backing** from iCKB Logic DAO deposits and iCKB supply |
| Organic holder concentration | **Live**: Stable++ Intent Lock + UTXOSwap pool locks excluded; unresolved large holders capped at warn |
| Wallet exposure | **Live** `GET /api/v1/wallet/{address}` + Wallet tab: lock label, balance, UDTs, counterparties, flagged-address exposure; taint `unknown` |
| Historical replay | **Live real dCKB transaction replay**: 3,464 txs, full details for candidate movements |
| Cell scans | **Full scan by default** (0 page cap, 180s budget); Seal completes at 10,662 cells / 108 pages |
| Scoring (0–100, A+…F, tiers, confidence, drivers) | Live |
| Dashboard + REST API + methodology endpoint | Live |
| Tier-change / score-jump alerts | Stored with `why_now` + evidence; **HMAC webhook + Telegram + SMTP email, 3 attempts, per-channel log** |
| Tests + headless browser smoke test | **15 unit tests**, smoke test |
| Public methodology | `docs/METHODOLOGY.md` v0.3.0 |
| Incident registry | dCKB, RGB++, iCKB limit-order; empty registry → `unknown` |

**Current live findings:** RUSD is **~26% off peg** (≈$0.74 vs $1) with **~$1,078 TVL**; USDI is **~67% off peg** (≈$0.33) with **~$165 TVL**; both pools are thin and ~30–40 days stale. iCKB's exchange rate is **1.2989 CKB/iCKB** against **2,857,480.70 CKB** of Logic DAO deposits and **2,199,999.92 iCKB** supply. The dashboard publishes price, TVL, depth and staleness together. These are real, sourced observations — not mocks — and exactly the blind spot the grant addresses. The MVP still marks missing data `unknown` (Stable++ CR/TCR/oracle, MoniMkt positions, AGENT/KOI/iCKB liquidity, taint) rather than inventing a number.

---

## 4. What this grant builds (full product v1.0)

### 4.1 Module map — Webacy-equivalent, CKB-native

| Capability | secnev Phase 1 |
|---|---|
| Stablecoin ratings + depeg monitoring | RUSD, USDI + any future CKB pegged asset; peg, supply, redemption, collateral, oracle, reserves |
| Vault ratings | iCKB, dCKB, Nervos DAO, MoniMkt, CKB lending markets; withdrawal, exchange rate, oracle, collateral, curator |
| Token risk (KYA) | xUDT/RGB++ mint authority, extensions, holders, liquidity, deployer, market integrity |
| Script analysis | audit, admin/upgrade, known CKB bug classes, value at risk |
| Wallet screening (KYW) | labels + counterparty exposure are live; Phase 1 adds cell-native behaviour, poisoning/lookalikes and taint |
| Transaction monitoring (KYT) | Phase 2 (CKB tx simulation is a separate build) |
| Monitoring + alerts | public feed, webhook (HMAC), email/Telegram opt-in |
| API / MCP | free REST API, MCP server for agents, embeddable badge |
| Incident registry | curated exploits/depegs/governance failures with root cause |
| Public reports | monthly ecosystem risk report |

### 4.2 New protocol adapters

- **Stable++ (RUSD):** vault cells, total debt, collateral ratio (MCR 125% BTC / 130% CKB per docs), TCR/CCR (145%/150%), redemption fee/base rate (12h half-life, 0.5% floor, 10% cap, 144 CKB minimum), oracle age/deviation.
- **iCKB:** exchange rate + backing are live; Phase 1 adds withdrawal liquidity/maturity and limit-order state, including the known limit-order confusion issue.
- **Nervos DAO:** deposit/withdraw epochs, compensation, lock maturity, large unlock waves.
- **MoniMkt:** testnet market state, utilization, LTV, oracle age; labelled testnet until mainnet.
- **Oracles:** cell publisher set, heartbeat, deviation vs DEX.
- **DEX liquidity:** direct pool-cell reads are already live for RUSD, USDI, STB, Seal and BTC; Phase 1 adds AGENT/KOI/iCKB discovery, a second venue and cross-venue spread.
- **RGB++/Rosen/Fiber:** Phase 2 (bridge proof/leap anomalies, channel liquidity).

### 4.3 Detector target

- 25+ live detectors across stablecoin/vault/token/script.
- 10+ wallet signals (labels, exposure, behaviour, poisoning).
- Every signal: status, score, confidence, evidence, first/last seen, source.

### 4.4 Coverage target

- 100% of CKB stablecoins/vaults above $100k TVL.
- Top 100 xUDT/RGB++ tokens by holders/liquidity.
- All deployed scripts above a value-at-risk threshold (Phase 2 for full coverage).

---

## 5. Milestones and budget

| # | Milestone | Weeks | Deliverables | Budget |
|---|---|---|---|---|
| **M1** | Harden the MVP | 1–4 | Persistent incremental indexer (full scan and real dCKB replay already live), 15 assets, 15 signals, protocol-state groundwork, tests, public demo | **$6,000** |
| **M2** | Stablecoin + vault modules | 5–9 | Stable++/MoniMkt adapters, oracle health, CR/TCR, withdrawal maturity, 20+ signals, AGENT/KOI pool discovery (iCKB exchange rate already live) | **$12,000** |
| **M3** | Token + wallet + alerts | 10–14 | xUDT/RGB++ token module, deployer/market integrity, wallet taint/behaviour (labels/exposure already live), MCP server, embeddable badge | **$10,000** |
| **M4** | Coverage, reports, handover | 15–18 | 100 assets, monthly public risk report, incident registry v1, security review, docs, reproducible snapshots, advisory review | **$8,000** |
| | **Total** | **18 weeks** | | **$36,000** |

### Budget breakdown

| Item | Amount |
|---|---|
| Lead maintainer (0.6 FTE, 18 weeks) | $20,000 |
| Protocol/data engineer (0.4 FTE) | $8,000 |
| Risk analyst / incident curation (0.2 FTE) | $3,000 |
| Infrastructure (RPC, DB, hosting, backups) | $1,500 |
| Independent security review + design | $2,000 |
| Contingency | $1,500 |
| **Total** | **$36,000** |

Payment: 20% upfront, then milestone-based. For budgets above $10k the DAO's staged-payment rule applies; we will publish every milestone report and transaction hash.

---

## 6. KPIs and verification

| KPI | Target |
|---|---|
| Assets scored | ≥100 |
| Stablecoins/vaults >$100k TVL | 100% |
| Live signals (stablecoin/vault/token) | ≥25 |
| Stablecoin freshness (p95) | <5 min |
| Vault freshness (p95) | <1 h |
| Alert delivery | webhook + Telegram/email, HMAC, retries |
| Detection lead time | alert before/at the incident in replay |
| False-positive rate (reviewed alerts) | <15% |
| Wallet/DEX integrations | ≥3 |
| Monthly API consumers | ≥20 |
| API uptime | ≥99.5% |
| External contributors | ≥5 |

**Verification is reproducible:** public repo, `npm test`, `npm run ingest`, `npm run replay`, and a public dashboard. Reviewers can run the stack locally in under 30 minutes.

---

## 7. Public-good commitments

- Apache-2.0 code; CC BY 4.0 data.
- Free dashboard, free API, public methodology and changelog.
- **No token, no paid scores, no sponsored rankings.**
- No issuer influence; disclose grants and conflicts.
- Publish post-mortems for missed detections and false positives.
- Monthly public risk report; all milestone reports and transaction hashes public.

---

## 8. Sustainability

- Phase 1 is grant-funded.
- Infrastructure is lean (~$150/month).
- If sustainability requires it later, offer **paid uptime/SLA** or **custom dashboards** — never paid scores or placement.
- No venture-scale assumption: the goal is a durable public good, not a token or an exit.

---

## 9. Team

- **Lead:** CKB-native engineer (indexer, detectors, API).
- **Protocol/data:** engineer with CKB cell/script experience.
- **Risk analyst:** stablecoin/vault methodology and incident curation.
- **Advisors (invited):** CKB Eco Fund, Magickbase, Stable++, iCKB, a wallet team, an independent researcher. Names published only after confirmation.

Why us: the MVP already exists, the docs are mirrored and cited, the code is CKB-native, and we did not cross-post a generic proposal to other ecosystems.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Indexer cost/lag | Own indexer + cache; freshness SLO; degrade to unknown |
| Cell reconstruction errors | Golden fixtures, replay tests, cross-check Explorer |
| Protocol state changes | Pin script hashes; alert on admin/script changes |
| False positives | Confirmation windows, review queue, publish misses |
| Small market | Wedge on RUSD/iCKB; wallet/DEX distribution; grants |
| Neutrality pressure | Public policy; no paid grades; advisory disclosure |
| Legal | Informational only; no AML/KYC claims; counsel review |
| Maintainer continuity | Open source, docs, 2 maintainers, 18-week runway |

---

## 11. Community engagement plan

1. Publish this proposal with the working demo and repo.
2. Post in English and Chinese on Nervos Talk; share in Nervos Nation and CKB builders.
3. Recruit 3 design partners (Stable++, iCKB, a wallet/DEX) before the vote.
4. Hold a public demo + AMA; answer technical questions with code links.
5. Target the DAO discussion gate (30 likes in one week) with a real demo, not a promise.
6. If the DAO is not the right fit, apply to CKB Eco Fund / Spark for the smaller hardening scope.

---

## 12. Smaller alternative: Spark request ($1,000, 100% CKB)

If the full grant is premature, fund the **product-completion pass**:

- **Stable++ protocol state**: collateral/TCR/CCR, oracle health, redemption/withdrawal state;
- **Developer Portal v1**: `/developers`, hashed API keys, usage limits, OpenAPI 3.1, TypeScript SDK;
- 10 user/developer validation sessions;
- public validation and completion reports.

This is a 6-week scope. The existing MVP already covers the risk engine, dashboard, API, pools, iCKB, wallet exposure, real dCKB replay and alerts; Spark funds the two missing halves: protocol solvency and developer access. See [`docs/GRANT_SPARK.md`](GRANT_SPARK.md) for the ready-to-post application.

---

## 13. References

- CKB docs: cell model, xUDT, Nervos DAO, RPCs — https://docs.nervos.org
- CKB Explorer API — https://ckb-explorer.readme.io
- Stable++ docs — https://stablepp.gitbook.io/stable++
- iCKB contracts + audit — https://github.com/ickb/contracts
- dCKB post-mortem — https://talk.nervos.org/t/dckb-post-post-mortem-now-the-funds-are-gone/11016
- ckb-adversary proposal — https://talk.nervos.org/t/spark-program-ckb-adversary-generic-attacks-on-real-ckb-transactions-before-you-deploy/11142
- CKB Community Fund DAO rules — https://talk.nervos.org/t/6874
- Prior landscape: `research/ckb/CKB_RISK_LANDSCAPE.md`, `research/ckb/WHY_QUANTIR_STALLED.md`
