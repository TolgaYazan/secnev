# secnev — CKB Risk Observatory

**Product requirements document (v0.1)**
Status: MVP v0.3 built and running on CKB mainnet — 10 assets, 72/105 live signal instances, RUSD/USDI/STB/Seal/BTC pool price + liquidity, iCKB exchange rate/backing, organic holder concentration, wallet exposure, real dCKB replay, full cell scans, webhook/Telegram/email; Phase 1 grant pending · Owner: secnev · Audience: founding team, CKB Eco Fund / DAO reviewers, design partners
Name: **secnev** (fixed by the project folder; no separate product name).

---

## 1. Executive summary

**secnev is an open, CKB-native risk observatory for the Nervos economy.** It continuously scores the things people actually put capital into — stablecoins (RUSD), vaults (iCKB, dCKB, Nervos DAO, MoniMkt), xUDT/RGB++ tokens, scripts, and wallets — and publishes the score, the evidence, and the alerts for free.

It is a **public good**, not a venture-scale SaaS:
- open-source code and open methodology,
- free public dashboard, API, and alert feed,
- no token, no paid ratings, no issuer influence,
- funded by ecosystem grants and infrastructure sponsorship,
- built CKB-native from the cell up — not an EVM engine with a CKB adapter.

The initial wedge is **RUSD / Stable++ health plus iCKB/dCKB vault risk**, because those are the assets where losses have already happened and where a named user (issuer, wallet, DEX) can act on the signal.

**Why now:** CKB has real assets but zero independent risk coverage. Elliptic, Nominis, Bitrace, Merkle Science and SlowMist publish no CKB coverage; TRM Labs and Chainalysis publish no CKB coverage page. Webacy does not support CKB. DefiLlama has no CKB L1 TVL or stablecoin data. The dCKB drain (~24.6M CKB) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days, per the ckb-adversary proposal) show the cost of that blind spot. The only direct attempt, Quantir's 2026 grant proposal, stalled at the DAO's discussion stage with no public CKB prototype.

**What success looks like in 12 months:** every CKB stablecoin and vault above $100k TVL is scored and monitored; the top 100 xUDT tokens by holders/liquidity are screened; at least three wallets/DEXs consume the API; every score is explainable and reproducible from public data.

---

## 2. Problem

### 2.1 The structural problem
CKB is a cell-based UTXO chain with RISC-V scripts. Risk cannot be inferred from EVM-style logs, token `owner()` calls, or standard event indexing. Behaviour lives in:
- **cells** (capacity, lock script, type script, data),
- **inputs → previous outputs → new outputs** (lineage),
- **xUDT type-script args** (owner lock hash, flags, extension `ScriptVec`),
- **RGB++ commitments** (Bitcoin-side binding, leap),
- **DAO deposits and vault state** (iCKB, dCKB, MoniMkt),
- **oracle cells** and **bridge/Fiber** flows.

No existing tool reconstructs these into a risk view.

### 2.2 The market problem
- **No coverage:** no Tier-1 analytics vendor supports CKB; no xUDT scanner; no stablecoin/vault rating.
- **No independent voice:** issuers and protocols self-report; there is no neutral score.
- **Incidents are learned from forum posts:** dCKB (Aug–Oct 2026), RGB++ forged proofs (Aug 2026), iCKB limit-order confusion, Stable++ oracle/liquidation risk.
- **Capital is small but real:** the point is not TVL size; it is that users cannot tell safe from unsafe before they deposit.

### 2.3 What users currently do
Read CKB Explorer, project docs, Discord, and audits manually. This works for experts and fails for everyone else — wallets, DEX users, new depositors, grant reviewers, and AI agents.

### 2.4 Adjacent landscape

| Alternative | What it gives | What it does not |
|---|---|---|
| **CKB Explorer / API** | Raw blocks, cells, xUDT lists, holder data, `suspicious`/`invalid` tags | No scores, drivers, alerts, wallet labels, or methodology |
| **DefiLlama** | EVM/Solana TVL and stablecoin data | No CKB L1 coverage (only deprecated Godwoken at $0) |
| **CertiK Skynet** | Token-level project page for CKB | One 2020 audit, no contracts/tokens, no DeFi coverage |
| **Quantir (proposal)** | Intent to adapt an EVM DeFi risk engine | No CKB product, no public prototype, stalled at discussion |
| **CKB Wallet Behaviour Intelligence** | Cell-native behavioural research + frozen API | No scores, ratings, alerts, or compliance workflow |
| **Audits (ScaleBit, CertiK)** | Point-in-time code review | No continuous monitoring or market/vault risk |
| **secnev** | CKB-native scores, evidence, alerts, API | Not a guarantee; not investment advice; not AML clearance |

---

## 3. Vision, mission, principles

**Vision:** a CKB economy where every asset carries an independent, explainable risk signal that anyone can check before capital moves.

**Mission:** build and operate a free, open, CKB-native risk observatory, and make its data available to wallets, DEXs, issuers, researchers, and agents.

### Principles

1. **CKB-native, not ported.** The cell model is the product. No EVM heuristics dressed up as CKB analytics.
2. **Public good first.** Free dashboard, free API, open source, open methodology. No token. No paywalled safety.
3. **Explainable by default.** Every score exposes drivers, evidence, freshness, and coverage. No black box.
4. **Evidence over opinion.** On-chain facts are primary; off-chain context is labelled and sourced.
5. **Fail closed, show uncertainty.** Missing or stale data is "unknown", never "safe".
6. **Neutral.** No issuer-paid ratings, no paid placement, no ranking for sale. Disclose conflicts.
7. **Small and shippable.** 15 high-signal detectors beat 400 unmaintainable factors.
8. **Reproducible.** Versioned methodology, snapshot hashes, replayable outputs.
9. **CKB only.** No EVM, no multi-chain dilution. Bitcoin data is used only where RGB++ requires it.

---

## 4. Users and jobs to be done

| User | Job | What they need |
|---|---|---|
| **Stablecoin / vault depositor** | "Is my RUSD/iCKB position safe right now?" | Score, drivers, withdrawal status, alerts |
| **Wallet (JoyID, UTXO Global, Rei, CKBull)** | "Warn me before my user signs a risky interaction" | Fast token/asset lookup, risk flags, API |
| **DEX (UTXOSwap, HueHub)** | "Should we list / warn on this xUDT?" | Token score, mint authority, concentration, liquidity |
| **Issuer (Stable++)** | "Is our peg/collateral/oracle healthy?" | Independent monitoring, public evidence, incident alerts |
| **Curator / lender (MoniMkt)** | "Is this vault/market safe to allocate to?" | Vault score, utilization, oracle, liquidation buffer |
| **CKB Eco Fund / DAO** | "Is this project safe / is the ecosystem healthy?" | Portfolio view, incident registry, public reports |
| **Researcher / journalist** | "What happened and when?" | Historical data, incident timeline, exportable evidence |
| **AI agent** | "Should I execute this transaction?" | API/MCP with machine-readable risk + freshness |

Primary persona for MVP: **a depositor or wallet engineer evaluating RUSD, iCKB, or a new xUDT** — one asset, one score, one reason.

---

## 5. Scope

### In scope (v1)
- Entity coverage: **stablecoins, vaults, xUDT/RGB++ tokens, scripts, wallets**.
- Continuous scoring with 0–100 risk, A+…F grade, tier, confidence, coverage.
- Public dashboard, public read-only API, webhook alerts, public alert feed.
- Historical scores and an incident registry.
- Open methodology and open-source code.

### Explicitly out of scope
- No token, no fundraising, no trading, no custody.
- No KYC/AML compliance claims; no sanctions "clearance" service.
- No investment advice, no price prediction, no yield recommendations.
- No EVM/multi-chain support in v1 (CKB + Bitcoin data needed for RGB++ only).
- No issuer-paid grades or sponsored rankings.
- No generic 400-factor engine; no "AI score" without evidence.

---

## 6. Product surfaces

```
                    +-----------------------------+
                    |   secnev web dashboard      |
                    |  overview - assets - alerts |
                    +--------------+--------------+
                                   |
  +---------------+        +-------v--------+        +-----------------+
  |  Public API   |<-------+  Risk engine   +------->|  Webhook alerts |
  |  REST + JSON  |        |  (detectors)   |        |  HMAC, retries  |
  +-------+-------+        +-------+--------+        +-----------------+
          |                        |
  +-------v-------+        +-------v--------+
  |  MCP server   |        |  CKB indexer   |
  |  (agents)     |        |  cells/txs     |
  +---------------+        +-------+--------+
                                   |
                    +--------------v--------------+
                    | CKB node - rich indexer -    |
                    | Explorer API - BTC data -    |
                    | DEX/oracle/vault cells       |
                    +-----------------------------+
```

### 6.1 Dashboard
- **Overview:** ecosystem health, tracked TVL, active alerts, newest incidents, coverage stats.
- **Stablecoins:** RUSD and any future pegged asset — score, peg, supply, redemption, collateral, oracle.
- **Vaults:** iCKB, dCKB, Nervos DAO, MoniMkt (testnet, clearly labelled), lending markets — score, withdrawal, exchange rate, oracle, admin.
- **Tokens:** xUDT/RGB++ — score, mint authority, extensions, holders, liquidity, deployer.
- **Scripts:** code hash lookup — verification, audits, admin/upgrade, known bug classes, value at risk.
- **Wallets:** address profile — labels, exposure/taint, behaviour, approvals, poisoning.
- **Incidents:** curated timeline with root cause, evidence, and affected assets.
- **Methodology:** public, versioned, with change log.

### 6.2 Public API
- Read-only, free, JSON, no key required for low volume.
- API key for higher rate limits and webhooks.
- Every response includes `score`, `grade`, `tier`, `drivers[]`, `signals[]`, `confidence`, `coverage`, `last_observed_at`, `stale`.

### 6.3 Alerts
- Tier change, score jump, new incident, admin/owner change, oracle stale/deviation, supply spike, withdrawal freeze, exchange-rate velocity.
- Delivery: public feed, webhook (HMAC), email/Telegram (opt-in).
- Alert payload includes `why_now`, `signal_deltas`, `evidence`, `first_seen`.

### 6.4 MCP server (Phase 2)
- Tools: `get_asset_risk`, `list_assets`, `get_wallet_risk`, `get_script_risk`, `get_incident`, `get_alerts`.
- Free; same data as API; designed for agents making pre-transaction checks.

---

## 7. Risk framework

### 7.1 Universal conventions
- **Risk score 0–100, higher = worse.**
- **Grade A+…F** (11-band scale, independently defined, versioned, and published).
- **Tier:** OK <25 · Watch 25–49 · Warning 50–69 · Critical ≥70.
- **Confidence:** high / medium / low, derived from signal coverage and data freshness.
- **Coverage:** `live_signals / total_signals` plus per-category counts.
- **Freshness:** `last_observed_at`, `stale` flag, `stale_reason`.
- **Explainability:** every score returns ranked `drivers[]` with weight, contribution, raw evidence, and human-readable reason.

### 7.2 Grade scale

| Grade | Score | Meaning |
|---|---|---|
| A+ | 0–5 | No material risk observed |
| A | 6–12 | Strong; minor watchpoints |
| A- | 13–20 | Strong; a few watchpoints |
| B+ | 21–28 | Good; minor structural risk |
| B | 29–37 | Good; several watchpoints |
| B- | 38–46 | Adequate; review recommended |
| C+ | 47–56 | Moderate; review |
| C | 57–66 | Moderate; monitor closely |
| C- | 67–77 | Elevated; close monitoring |
| D | 78–88 | High |
| F | 89–100 | Critical |

### 7.3 Entity models

#### Stablecoin (RUSD first)
| Category | Weight | Signals |
|---|---|---|
| Peg & market | 30% | DEX price deviation, persistence, cross-venue spread, liquidity depth |
| Backing & supply | 25% | On-chain supply vs reported, mint authority, collateral ratio (CDP), reserve evidence |
| Redemption & exit | 20% | Burn/redemption velocity, redemption route/fees, DEX exit depth |
| Governance & script | 15% | Admin/owner lock, upgradeability, oracle integrity, pause/freeze powers |
| Counterparty & incidents | 10% | Bridge dependencies, issuer history, exploit/incident record |

#### Vault (iCKB, dCKB, Nervos DAO, MoniMkt, lending)
| Category | Weight | Signals |
|---|---|---|
| Script & code | 20% | Verification, audits, immutability, known bug classes |
| Governance & admin | 20% | Owner lock, multisig/timelock, upgrade path, pause |
| Liquidity & withdrawal | 25% | Withdrawable %, queue, lockups, utilization, exit depth |
| Collateral & oracle | 20% | Collateral quality, LTV/CR, oracle age/deviation/sources |
| Strategy & counterparty | 10% | Protocol dependencies, curator, bridge exposure |
| Incidents & maturity | 5% | Exploit history, age, TVL trend |

#### xUDT / RGB++ token
| Category | Weight | Signals |
|---|---|---|
| Mint & authority | 25% | Owner lock, mint capability, supply cap, extension scripts |
| Holder concentration | 20% | Organic top-10/30, exclusions (DEX, DAO, bridges) |
| Liquidity | 20% | Pool depth, decay, exit cost, LP concentration |
| Script & extensions | 15% | xUDT flags, extension scripts, verification, deployer |
| Deployer & behaviour | 10% | Serial deployer, prior flags, funding source |
| Market integrity | 10% | Volume anomaly, wash patterns, price-source disagreement |

#### Script
| Category | Weight | Signals |
|---|---|---|
| Audit & verification | 25% | Source/build reproducibility, audit firms/dates |
| Admin & upgrade | 25% | Owner lock, upgradeability, timelock, pause |
| Known bug classes | 20% | Output-lock omissions, limit-order confusion, proof binding, cell-dep checks |
| Value at risk | 15% | Live cells/capacity secured |
| Incident history | 15% | Prior exploits, advisories |

#### Wallet
| Category | Weight | Signals |
|---|---|---|
| Direct labels | 35% | Exchange, bridge, DAO, known exploit, swap service |
| Counterparty & taint | 25% | Inbound/outbound exposure, hops, share of inflow |
| Behaviour | 20% | Cell topology, timing, fragmentation, templates |
| Approvals & poisoning | 10% | Lookalike addresses, dusting, dangerous approvals |
| Illicit exposure | 10% | Public sanctions/exploit lists, clearly sourced |

> Wallet scoring is **exposure intelligence**, not a compliance determination. We publish sources and confidence.

### 7.4 Score aggregation
```
category_score = weighted average of live signals (0–100)
risk_score     = Σ(category_score × category_weight) + additive_penalties
risk_score     = clamp(risk_score, hard_floors, 100)
```
- Missing signals are dropped and weights renormalised; coverage is reported.
- Additive penalties for binary conditions (e.g. mint authority is a single EOA + no cap +10; oracle stale +15; redemptions closed floor 75).
- Hard floors for catastrophic states (withdrawal frozen 75; active depeg 70; exploit in progress 65).
- Any guard/floor is surfaced as a `driver` with zero weight and a reason.

---

## 8. Detector catalog (v1.0: 18 signals; MVP: 12)

Each detector outputs `{id, status, score, confidence, evidence, first_seen, last_seen, source}`. MVP ships a 12-signal subset: stablecoin 1–7, vault 11–13, token 16–17. Phase 1 adds 8–10, 14–15, 18. Wallet and bridge signals (19–22) are Phase 2.

### Stablecoin / peg
1. **Peg deviation** — DEX VWAP vs $1; >0.5% for 15 min = warning, >2% = critical.
2. **Peg persistence** — minutes off-peg in 60 min; 30+ min escalates.
3. **Cross-venue spread** — same asset across pools; >1% = fragmentation.
4. **Supply reconciliation** — on-chain xUDT supply vs issuer-reported circulating; >2% mismatch.
5. **Mint authority** — owner lock is a single key, no supply cap, or extension permits mint; critical if uncapped.
6. **Redemption velocity** — burn/DAO-withdraw acceleration vs 30-day baseline; z > 3.
7. **Liquidity depth & decay** — exit cost for $100k; >30% 24h decay.
8. **Collateral ratio (CDP)** — vault CR vs MCR; TCR vs CCR; distance to liquidation.
9. **Oracle health** — age > 15 min, deviation > 2%, single publisher, stale cell.
10. **Redemption route** — fees, caps, paused/frozen state, minimum size.

### Vault
11. **Withdrawal availability** — withdrawable % of TVL, queue length, lockup, utilization > 95%.
12. **Exchange-rate velocity** — share price +2% in 1h (donation/exploit) or −1% (loss).
13. **Admin/owner change** — type-script args, owner lock, code hash, timelock absence.
14. **Limit-order anomaly** — phantom orders, master-cell mismatch, stranded funds (iCKB).
15. **DAO/unlock wave** — large deposit withdrawals or maturity clustering.

### Token
16. **Holder concentration** — organic top-10 share, exclusions, HHI.
17. **xUDT extension risk** — flags, extension scripts, owner-mode bits, verification.
18. **Deployer history** — serial deployments, prior flagged tokens, funding source.

### Wallet / bridge (Phase 2)
19. **Taint/exposure** — inflow from known exploit/swap/exchange addresses, hop count.
20. **Poisoning/lookalike** — similar addresses in history, dusting pattern.
21. **Bridge/RGB++ anomaly** — proof verification failures, abnormal leap/commitment flows.
22. **Cell fragmentation** — outputs per tx, dust cells, consolidation bursts.

> v1 ships 1–18; 19–22 are Phase 2.

---

## 9. Data and architecture

### 9.1 Sources
| Source | Use | Notes |
|---|---|---|
| CKB node RPC | blocks, txs, live cells, capacity, epochs | primary truth |
| ckb-indexer (rich indexer) | cells by script, transactions, live/dead | own deployment |
| CKB Explorer API | cross-check, metadata, xUDT tags | fallback/enrichment |
| Bitcoin RPC / public API | RGB++ commitments, proof anchoring | needed for RGB++ |
| DEX pool cells (UTXOSwap/HueHub) | price, liquidity, volume | read cells directly where possible |
| Oracle cells (Stable++, MoniMkt) | price, age, publisher | on-chain |
| Protocol contracts | vault state, CDP, DAO | on-chain |
| Off-chain | audits, issuer disclosures, incident posts | curated, sourced, dated |

### 9.2 Pipeline
```
ingest → normalize → entity resolution → feature extraction
      → detectors → scoring → cache/API → alerts
```
- **Normalize:** canonical tx/cell schema: `tx_hash, block, inputs[], outputs[], capacity, lock_script, type_script, data, lineage`.
- **Entity resolution:** map type scripts to assets; lock scripts to addresses/entities; label exchanges, DAO, bridges, exploit addresses.
- **Feature store:** per-asset time series (price, supply, liquidity, holders, CR, oracle age).
- **Determinism:** store raw snapshots + methodology version; replay any score.

### 9.3 Storage & hosting
- PostgreSQL + TimescaleDB for time series.
- Object storage for raw blocks/cells and audit artifacts.
- Redis for hot cache.
- One region, Cloudflare in front; $100–300/month at MVP scale.
- Open-source deployment (Docker Compose + Terraform) so anyone can run it.

### 9.4 Data quality
- Multi-source where possible (node + Explorer + DEX reads).
- Explicit `data_quality` per signal: `high/medium/low`, `last_observed_at`, `source`.
- No silent fallbacks: if a source fails, the signal is `unknown`, coverage drops, confidence drops.
- Staleness thresholds per entity; stale = fail closed.

### 9.5 Core schema (indicative)

```
assets        id, type, symbol, name, chain, type_script_hash, lock_script_hash,
              issuer, launched_at, tags[], coverage_live, coverage_total
blocks        height, hash, timestamp, epoch, tx_count
txs           hash, block_height, timestamp, inputs[], outputs[], fee, witnesses
cells         outpoint, tx_hash, index, capacity, lock_script, type_script, data,
              created_at, consumed_at, lineage_parent
scripts       code_hash, hash_type, args, first_seen, deployer, verified, audits[]
entities      id, kind (exchange|bridge|dao|issuer|exploit|swap|unknown), name, addresses[]
signals       asset_id, detector_id, status, score, confidence, evidence_json,
              first_seen, last_seen, source
scores        asset_id, ts, score, grade, tier, coverage, drivers_json,
              methodology_version, snapshot_hash
labels        address, entity_id, label, source, confidence, first_seen
incidents     id, ts, asset_id, category, mechanism, loss_usd, status,
              root_cause, evidence_links[]
alerts        id, asset_id, detector_id, severity, tier_from, tier_to,
              why_now, evidence_json, created_at, delivered_at
```
Indexes: `cells(type_script, consumed_at)`, `txs(block_height)`, `signals(asset_id, detector_id, ts)`, `scores(asset_id, ts)`, `labels(address)`.

### 9.6 Non-functional requirements

| Area | Requirement |
|---|---|
| Ingestion lag | < 60s p95 from block acceptance to indexed |
| API latency | < 300ms p95 cached; < 2s p95 cold |
| Dashboard | LCP < 2.5s on 4G; usable on mobile |
| Uptime | ≥ 99.5% API; status page |
| Retention | Raw cells/txs ≥ 12 months; scores/incidents indefinitely |
| Scale | 10k assets, 1M cells/day, 100 req/s burst |
| Reproducibility | Any score re-computable from a stored snapshot + methodology version |
| Accessibility | WCAG 2.1 AA |
| Security | Hashed keys, signed webhooks, dependency scanning, least-privilege deploys |

---

## 10. Functional requirements

### 10.1 Asset list
- Filter by type (stablecoin, vault, token, script), chain (CKB), tier, grade, TVL, confidence.
- Sort by score, TVL, 24h change, alert count.
- Search by symbol, name, type-script hash, address.
- Show coverage badge (e.g. "14/18 signals live").

### 10.2 Asset detail
- Header: name, symbol, type, score, grade, tier, confidence, last updated.
- Score drivers ranked worst-first with evidence.
- Category breakdown with weights.
- Charts: score history, peg, supply, liquidity, CR, oracle age.
- Contracts/scripts: code hash, args, owner lock, extensions, audits.
- Holders: top organic holders, exclusions, concentration.
- Incidents: linked events.
- Actions: copy API call, subscribe to alerts, view raw signals.

### 10.3 Alerts
- Rule engine with thresholds per detector.
- Deduplicate and suppress noise (cooldown, confirmation windows).
- Public feed with severity, asset, reason, first seen, evidence.
- Webhook subscription CRUD, HMAC secret, retries (5), delivery log.

### 10.4 Incidents
- Curated timeline; each entry: date, asset, category, mechanism, loss, root cause, evidence links, status (active/resolved/disputed).
- Auto-link incidents to affected scores.

### 10.5 Methodology
- Public page per entity type: categories, weights, thresholds, guards, version, changelog.
- Machine-readable `GET /v1/methodology`.

### 10.6 Admin
- Source health, ingestion lag, detector failures, coverage report, manual label review, incident editor.
- Audit log for methodology and label changes.

### 10.7 MVP acceptance criteria

The 6-week MVP is done when all of the following are true:

1. Indexer follows CKB mainnet head with < 60s lag and reconstructs cell lineage for the last 30 days.
2. RUSD, iCKB, dCKB, Nervos DAO, MoniMkt and five xUDT assets are scored and visible.
3. Every score exposes at least 8 live signals, ranked drivers, evidence, confidence, coverage, and `last_observed_at`.
4. The API returns the same data as the dashboard and passes a published JSON schema.
5. One webhook delivers a signed alert for a simulated tier change, with retry and delivery log.
6. Replaying the dCKB drain window produces at least one alert before the final cash-out; replaying the RGB++ forged-proof window flags the anomaly.
7. Methodology v0.3 is public and every threshold in it matches the code.
8. A new contributor can run the stack locally from the README in under 30 minutes.
9. The public demo link and repo are live before the grant application is submitted.

---

## 11. UX and information architecture

```
/                         Overview
/stablecoins              List
/stablecoins/[id]         Detail
/vaults                   List
/vaults/[id]              Detail
/tokens                   List
/tokens/[id]              Detail
/scripts                  Lookup
/scripts/[code_hash]      Detail
/wallets                  Lookup
/wallets/[address]        Profile
/incidents                Timeline
/alerts                   Live feed + history
/methodology              Framework + changelog
/api                      Docs + playground
/about                    Mission, governance, funding
```

Design: clean, data-dense, no dark patterns. Every red score is clickable to its evidence. Mobile-first for depositors. Accessibility AA. **Bilingual EN/ZH from day one** — the CKB community is bilingual, and grant review happens in both languages.

---

## 12. API specification (v1)

Base: `https://api.secnev.xyz/v1` (placeholder)
Auth: none for public reads; optional `x-api-key` for higher limits and webhooks.
Rate limits: 60 req/min per IP; 600 req/min per key; 429 with `Retry-After`.

### Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/assets` | List assets (type, tier, grade, q, sort, page) |
| GET | `/assets/{id}` | Asset detail (score, drivers, signals, coverage) |
| GET | `/assets/{id}/history` | Score/peg/supply/liquidity time series |
| GET | `/wallets/{address}` | Wallet profile, labels, exposure |
| GET | `/scripts/{code_hash}` | Script risk, audits, admin, incidents |
| GET | `/incidents` | Incident registry |
| GET | `/alerts` | Alert feed |
| GET | `/methodology` | Machine-readable framework |
| POST | `/webhooks` | Create subscription (key required) |
| GET | `/webhooks/{id}` | Delivery status |
| DELETE | `/webhooks/{id}` | Remove |

### Response envelope
```json
{
  "schema_version": "1.0",
  "id": "ckb:xudt:0x…",
  "type": "stablecoin",
  "symbol": "RUSD",
  "name": "Stable++ RUSD",
  "score": 42,
  "grade": "B-",
  "tier": "watch",
  "confidence": "medium",
  "coverage": { "live": 14, "total": 18 },
  "last_observed_at": "2026-11-12T10:00:00Z",
  "stale": false,
  "drivers": [
    {
      "category": "oracle_health",
      "signal": "oracle_age",
      "weight": 0.15,
      "contribution": 9.2,
      "score": 61,
      "evidence": { "age_seconds": 1180, "publisher_count": 1 },
      "reason": "Oracle cell is 19m old and has a single publisher."
    }
  ],
  "signals": [
    { "id": "peg_deviation", "status": "pass", "score": 2, "confidence": "high" }
  ]
}
```

### Webhook payload
```json
{
  "event": {
    "type": "ASSET_TIER_CHANGE",
    "id": "evt_…",
    "timestamp": "2026-11-12T10:00:00Z",
    "data": {
      "asset_id": "ckb:xudt:0x…",
      "symbol": "RUSD",
      "old_tier": "ok",
      "new_tier": "watch",
      "score": 42,
      "why_now": "Oracle age crossed 15m with a single publisher.",
      "evidence": ["tx:0x…", "cell:0x…"]
    }
  },
  "signature": "hmac-sha256-hex",
  "delivered_at": "2026-11-12T10:00:01Z"
}
```

---

## 13. Monitoring and alerts

| Alert | Trigger | Severity |
|---|---|---|
| Tier change | OK→Watch/Warning/Critical, or reverse | medium/high |
| Score jump | +20 points in 1h | high |
| Peg deviation | >0.5% 15m / >2% | warning/critical |
| Supply spike | >5% in 1h or >2% in one block | critical |
| Mint authority change | owner lock/args/code hash change | critical |
| Oracle stale | age > 15m | high |
| Oracle deviation | >2% vs DEX | high |
| Withdrawal freeze | vault pause/queue | critical |
| Exchange-rate move | +2% / −1% in 1h | critical |
| New incident | curated exploit/depeg | high |
| Bridge anomaly | proof/leap anomaly | critical |

Noise controls: confirmation window (2 consecutive readings for tier changes), cooldown (1h per asset/detector), and suppression of alerts based on untrusted price feeds. Every alert states its evidence and confidence.

---

## 14. Public-good model

### 14.1 Openness
- Code: **Apache-2.0** on GitHub (patent grant, permissive reuse); reproducible builds.
- Methodology: public, versioned (`v1`, `v1.1`), with a changelog and RFC process.
- Data: public API and bulk export (JSON/CSV); **CC BY 4.0** with attribution for research and reuse.
- No paywalled safety scores.

### 14.2 Governance
- **Steward:** a small maintainer team (2–3 people).
- **Advisory group (non-binding, invited):** CKB Eco Fund, Magickbase, Stable++, iCKB, a wallet team, an independent researcher. Confirm participation before publishing names.
- **Methodology changes:** public RFC, 30-day comment, version bump; no retroactive grade changes without notice.
- **Neutrality policy:** no issuer-paid scores, no sponsored rankings, no token. Disclose grants and conflicts.
- **Incident review:** publish post-mortems for missed detections and false positives.

### 14.3 Funding (no venture)
| Source | Use | Notes |
|---|---|---|
| Spark Program | MVP ($1–2k) | 6-week prototype |
| CKB Community Fund DAO | Phase 1 ($30–45k) | staged milestones, 20% upfront |
| CKB Eco Fund | infrastructure/coverage | strategic grants |
| Infrastructure sponsorship | hosting/RPC | no influence on scores |
| Donations | maintenance | optional |

No token. No paid tiers in year 1. If sustainability requires it later, offer **paid uptime/SLA** or **custom dashboards** — never paid scores or placement.

### 14.4 Legal posture
- Informational only; not investment, legal, or compliance advice.
- Wallet screening is exposure intelligence, not a KYC/AML determination.
- Sanctions/illicit labels only from public authoritative sources, with provenance.
- Terms, privacy, and a clear "no warranty" disclaimer.

### 14.5 Security and privacy
- Public on-chain data only; no personal data, no KYC, no custody.
- API keys stored hashed; webhook secrets rotatable; HMAC verification documented.
- Rate limiting, request logging without sensitive payloads, dependency scanning.
- Reproducible builds and signed releases; security contact published.
- Wallet profiles are behavioural/exposure views of public addresses, with a correction process for wrong labels.

### 14.6 Launch and distribution
- **CKB Talk + Nervos Nation + X** launch post with a 3-minute demo and a public incident replay.
- **Design partners first:** Stable++, iCKB, one wallet (JoyID/UTXO Global), one DEX (UTXOSwap/HueHub).
- **Embeddable badge** (`<script>` + JSON) so wallets/DEXs can show a score without building UI.
- **Monthly public risk report** for the ecosystem (incidents, coverage, misses).
- **Grants:** Spark for MVP, DAO/Eco Fund for Phase 1; publish every milestone and transaction hash.

---

## 15. Roadmap

### Phase 0 — MVP (weeks 1–6)
- Indexer + cell reconstruction for CKB mainnet.
- 10 assets: RUSD, USDI, iCKB, STB, Seal, AGENT, KOI, ccBTC, dCKB (incident), MoniMkt (testnet).
- 12 detectors (stablecoin/vault/token core).
- Public dashboard + API + one webhook.
- Retro-detection: dCKB drain and RGB++ forged-proof window.
- Deliverable: public repo, demo, methodology v0.3, Spark application.

### Phase 1 — Public beta (months 2–4)
- 18 detectors; wallet module; incident registry.
- Alerts (webhook + Telegram/email), history charts.
- 3 design partners (issuer, wallet, DEX).
- Coverage: all stablecoins/vaults >$100k TVL; top 100 xUDT.
- DAO proposal with traction.

### Phase 2 — Integrations (months 5–8)
- MCP server; embeddable badge/widget; bulk export.
- Bridge/RGB++ and Fiber signals.
- Wallet/DEX integrations live.
- Public methodology v1.0; advisory group.

### Phase 3 — Durability (months 9–12)
- Full incident registry and annual report.
- Reproducible replay for any historical score.
- Multi-maintainer handover plan; grant renewal or sponsorship.

---

## 16. Success metrics

| Dimension | Metric | Target (12 months) |
|---|---|---|
| Coverage | Stablecoins/vaults >$100k TVL scored | 100% |
| Coverage | Top xUDT by holders/liquidity | 100 (top 100) |
| Freshness | Stablecoin score age (p95) | < 5 min |
| Freshness | Vault score age (p95) | < 1 h |
| Detection | Retro lead time vs incident | alert before/at event |
| Quality | False-positive rate (reviewed alerts) | < 15% |
| Explainability | Scores with evidence + coverage | 100% |
| Adoption | Wallet/DEX integrations | ≥ 3 |
| Adoption | Monthly API consumers | ≥ 20 |
| Adoption | Monthly dashboard users | ≥ 1,000 |
| Openness | Methodology public + versioned | 100% |
| Reliability | API uptime | ≥ 99.5% |
| Community | External contributors | ≥ 5 |

---

## 17. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Data/indexer cost or lag | Stale scores | Own indexer + cache; freshness SLO; degrade to unknown |
| Cell reconstruction errors | Wrong scores | Replay tests, golden fixtures, cross-check Explorer |
| Small market / low usage | Public good underused | Wedge on real losses; wallet/DEX distribution; grants |
| False positives | Credibility loss | Confirmation windows, review queue, publish misses |
| Issuer pressure | Neutrality | Public policy, no paid grades, advisory disclosure |
| Legal/regulatory | Liability | Informational-only, no AML claims, counsel review |
| Maintainer continuity | Project dies | Open source, docs, 2 maintainers, grant runway |
| RGB++/Bitcoin dependency | Incomplete coverage | Phase 2; label coverage gaps |
| Name/brand conflict | Minor | Trademark check before launch |

---

## 18. Team and budget (public-good, lean)

### MVP (6 weeks)
- 1 protocol/data engineer (indexer, detectors) — full-time.
- 1 full-stack engineer (dashboard/API) — full-time.
- 0.3 risk analyst (methodology, incident curation).
- 0.2 designer.
- **Cost:** ~$8–12k out-of-pocket for a founder-led/part-time build; ~$30–40k if all roles are contracted. The Spark-scale ask ($1–2k) covers only infrastructure and incident curation for the founder-led path.

### Year 1
| Item | Cost |
|---|---|
| Maintainer (0.5–1 FTE) | $30–45k |
| Infrastructure (RPC, DB, hosting) | $3.6k |
| Data/curation (audits, incidents) | $6k |
| Design/security review | $5k |
| Contingency | $3k |
| **Total** | **$45–60k** |

Grant ask: **$30–45k**, staged; Spark for the MVP; DAO/Eco Fund for Phase 1. No token, no equity.

If only $30k is available, scope Phase 1 to a 0.5 FTE maintainer, defer the design/security review, and keep infrastructure at ~$150/month. The difference is made up by infrastructure sponsorship or donations, never by paid scores.

---

## 19. Open decisions

1. **Wedge:** RUSD/Stable++ first, or iCKB/dCKB first? (Recommend RUSD + iCKB together; one stablecoin, one vault.)
2. **Indexer:** build on `ckb-indexer` + own normalizer, or start with Explorer API? (Recommend own indexer from week 1; Explorer as fallback.)
3. **Wallet module in v1?** (Recommend Phase 1, not MVP.)
4. **RGB++/Bitcoin:** include in v1 or Phase 2? (Recommend Phase 2; label coverage gap.)
5. **Hosting jurisdiction** and entity for grants.
6. **Public API domain and hosting jurisdiction.**

---

## 20. Appendices

### A. Glossary
Cell · lock script · type script · capacity · xUDT · sUDT · RGB++ · leap · Nervos DAO · iCKB · dCKB · RUSD · MCR/CCR · Fiber · Rosen Bridge · CKB-VM.

### B. Data dictionary (selected)
| Field | Meaning |
|---|---|
| `asset_id` | `ckb:{type}:{type_script_hash}` |
| `score` | 0–100, higher = worse |
| `grade` | A+…F |
| `tier` | ok/watch/warning/critical |
| `confidence` | high/medium/low |
| `coverage.live/total` | signals evaluated |
| `last_observed_at` | ISO timestamp |
| `stale` | boolean |
| `drivers[]` | ranked contributors with evidence |
| `signals[]` | per-detector status/score/confidence |

### C. CKB-specific checks
- Cell lineage: input → previous output → new output.
- xUDT args: owner lock hash, flags (`0x1FFFFFFF`, `0x20000000`, `0x40000000`, `0x80000000`), `ScriptVec`.
- Output locks are not executed — limit-order/phantom-output class of bugs.
- RGB++ commitment/proof binding; forged-proof detection.
- DAO deposit/withdraw epoch and compensation.
- Oracle cell publisher set and heartbeat.

### D. References
- CKB docs: cell model, xUDT, Nervos DAO.
- CKB Explorer API.
- Stable++ docs (RUSD, MCR/CCR, redemption).
- iCKB contracts and ScaleBit audit.
- dCKB post-mortem (Nervos Talk 11016).
- ckb-adversary proposal (Nervos Talk 11142).
- CKB Community Fund DAO rules and funded list.
- Prior landscape: `research/ckb/CKB_RISK_LANDSCAPE.md`, `research/ckb/WHY_QUANTIR_STALLED.md`.

---

*This document is the product contract. Changes require a version bump and a public changelog entry.*




