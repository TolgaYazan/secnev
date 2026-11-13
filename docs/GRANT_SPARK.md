# Spark Program | secnev — CKB-native risk observatory

**Request:** **$1,000, 100% in CKB** · **Timeline:** 6 weeks · **Category:** risk intelligence / developer tooling / public-good infrastructure
**Repository:** https://github.com/TolgaYazan/secnev · **Live app:** https://secnev.vercel.app

> Ready to post in **Nervos Talk → `daos-funding` → `Spark Program`**.
> The old `Spark-Program` tag is no longer required after the July 2026 forum change; the Spark Program sub-section is the current venue.

---

## 0. Title & tags

**Title:** `Spark Program | secnev — CKB-native risk observatory`

**Venue:** Nervos Talk → `daos-funding` → `Spark Program`

**Tags:** none required. Do not use the old `Spark-Program` tag if the sub-section is selected.

---

## 1. Project overview

**Project name:** secnev

**One sentence:** secnev is an open, CKB-native risk observatory that turns live cells, scripts, pools and protocol state into explainable risk scores for CKB stablecoins, vaults, xUDT/RGB++ tokens and wallets.

**Positioning:** risk intelligence infrastructure + public dashboard + free API + developer tooling.

**What already exists:** a working MVP on CKB mainnet — 10 assets, real cell-level data, live RUSD/USDI market price and liquidity, iCKB exchange rate/backing, organic holder concentration, wallet exposure, real dCKB transaction replay, alerts, dashboard, API and Vercel deployment.

**What Spark adds:** the two missing halves that turn the MVP into a complete stablecoin risk product:

1. **Stable++ protocol state** — collateral, oracle and redemption health behind RUSD.
2. **Developer Portal v1** — API keys, usage limits, OpenAPI and TypeScript SDK so CKB wallets, DEXs, issuers and data teams can actually integrate secnev.

These are one coherent product story: **market risk + protocol risk + developer access**.

---

## 2. Team profile

**Applicant:** Tolga Yazan — independent CKB-native engineer.

**Role:** protocol/data engineering, API design, developer experience and documentation.

**Background:** built the working secnev MVP before this application: live CKB RPC/Explorer ingestion, xUDT parsing, UTXOSwap pool-cell reads, iCKB Logic DAO exchange-rate/backing, wallet exposure, real dCKB transaction replay, tests, dashboard and Vercel deployment.

**GitHub:** https://github.com/TolgaYazan

**Project repository:** https://github.com/TolgaYazan/secnev

**Email:** capethcrazy@gmail.com

**Discord:** `<add your Discord username here>`

> The GitHub repository already exists under the applicant account. This is the identity-proof repository requested by the Spark Committee in the July 2026 update.

---

## 3. Project background

CKB has real assets but no independent risk layer. The dCKB drain (~24.6M CKB) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days, per the ckb-adversary proposal) show what the blind spot costs.

secnev already answers the market half of the question:

- 10 CKB assets scored from real mainnet cells.
- **72/105 signal instances live; 33 explicitly `unknown`**, with coverage disclosure.
- The readable RUSD/CKB pool is **~26% off peg** with **~$1,078 TVL**; USDI is **~67% off** with **~$165 TVL**. Both pools are thin and ~30–40 days stale, and the dashboard publishes that.
- iCKB exchange rate/backing is live: **1.2989 CKB/iCKB**, 2,857,480.70 CKB of Logic DAO deposits against 2,199,999.92 iCKB.
- Wallet exposure, real dCKB replay, full cell scans, alerts and Vercel deployment are working.

Two gaps remain before secnev is a complete RUSD risk product:

1. **Protocol solvency is missing.** A DEX price can tell a user that RUSD is off peg. It cannot tell them whether the Stable++ vault is solvent, whether the oracle is healthy, or whether redemptions and withdrawals are functioning.
2. **Developers cannot onboard.** There is no API key, usage limit, OpenAPI contract or SDK. A CKB wallet, DEX, issuer or data team has to reverse-engineer the API and write its own client.

Both gaps are visible in Webacy's product, and both are concrete, verifiable, and small enough for a 6-week Spark.

---

## 4. Solution

Spark funds a focused completion pass on the existing secnev application — not a rebuild, and not a grab bag of new detectors.

### 4.1 Stable++ protocol-state module

Add three protocol-level signals to RUSD, next to the existing market signals:

1. **Collateral health** — vault cells, total debt, collateral ratio, MCR/TCR/CCR, liquidation buffer.
2. **Oracle health** — oracle cell age, feed/publisher identity, deviation from the live DEX price.
3. **Redemption / withdrawal state** — redemption fee/base rate, pause state, and whether the protocol can honour exits.

Every field is sourced from on-chain data. If a field is not publicly accessible or cannot be verified, it stays `unknown` with the reason published. Nothing is invented.

### 4.2 Developer Portal v1

Add a `/developers` onboarding layer on top of the existing API:

- self-serve hashed API keys with revocation;
- free-tier usage limits and rate limits;
- OpenAPI 3.1 contract;
- TypeScript SDK with typed methods;
- copy-paste curl/TypeScript/Python examples;
- usage panel.

This turns secnev from “a good dashboard” into infrastructure other CKB teams can build on.

### 4.3 Validation

Run **10 validation sessions** with a mix of CKB depositors, wallet engineers, DEX/issuer teams and data analysts. The output is a public report: did the protocol signals change a decision, and did a developer get to a first successful request in under ten minutes?

### Explicitly out of scope

- no new assets or new risk categories beyond the Stable++ state;
- no paid tiers or billing;
- no MCP or x402 in this round;
- no sanctions/taint or transaction monitoring;
- no issuer-controlled ranking, token or paid scores.

MCP, wallet poisoning/sanctions and transaction monitoring are documented as later Spark/DAO candidates, not hidden inside this ask.

---

## 5. Technical approach

**Stack:** Node.js 24 + TypeScript, native `node:sqlite`, CKB public RPC `get_cells`, CKB Explorer API, vanilla JS dashboard, Vercel static + serverless functions, Upstash Redis free tier for API keys/usage.

**Architecture:**

```
Stable++ vault/oracle cells ─┐
UTXOSwap RUSD pool ──────────┼─> detectors ─> score ─> API / dashboard
CKB RPC / Explorer ──────────┘                         │
                                                       ├─ webhook / Telegram / email
                                                       └─ /developers portal
                                                              │
                                                     keys + usage (Redis)
```

**Stable++ adapter:**

- locate vault/debt/oracle/redemption cells from deployed scripts;
- decode cell data with the existing little-endian/u128 and script-fingerprint utilities;
- add `collateral_health`, `oracle_health` and `redemption_state` to the vault detector set;
- cross-check oracle price against the live RUSD/CKB pool, publishing both plus TVL and last-trade age;
- fixtures and tests so the adapter is reviewable without a live wallet.

**Developer Portal:**

- keys are `sk_live_<random>`; only SHA-256 hashes are stored;
- `x-api-key` header; anonymous requests are allowed but IP-limited;
- rate limits use Redis `INCR` + TTL windows;
- portal endpoints consolidated into one `/api/portal` function; the unused Vercel `/history` route is retired to stay within Hobby's 12-function limit (history remains in the local API);
- one `openapi.json` is the source of truth for docs and the SDK;
- the SDK is a thin typed `fetch` wrapper with no runtime dependencies.

**Fail-closed rule:** missing or stale protocol data is `unknown`, never “safe”. Coverage and confidence remain visible in every response.

---

## 6. To-do list

| Week | Work | Milestone |
|---|---|---|
| **1** | Map Stable++ vault/debt/oracle/redemption scripts and cell layouts; document every field and every unknown; create fixtures | Protocol map + fixture set |
| **2** | Implement the Stable++ adapter; add the three signals and unit tests | Adapter merged; tests pass |
| **3** | Integrate the new signals into the dashboard and API; deploy a preview with evidence/coverage labels | Public preview with RUSD protocol state |
| **4** | Build Developer Portal v1: `/developers`, hashed keys, usage/rate limits, OpenAPI, TypeScript SDK | Portal + SDK live on preview |
| **5** | Run 10 validation sessions (CKB depositors, wallet/DEX/issuer/data teams); fix the highest-impact onboarding and signal issues | Validation notes + issue list |
| **6** | Final docs, security pass, public validation report, completion report, handover | Spark completion package |

Every week ends with a verifiable artifact.

---

## 7. Required funding and breakdown

**Requested:** **$1,000 USD equivalent, 100% in CKB.**

CKB amount will be calculated at the Committee's approval-day rate. The request is denominated in USD so the scope is stable.

| Item | Amount | Purpose |
|---|---:|---|
| Stable++ protocol-state adapter | **$400** | Cell/oracle mapping, three signals, fixtures, tests |
| Developer Portal v1 | **$350** | API keys, usage/rate limits, OpenAPI, TypeScript SDK, portal UI |
| Dashboard/API integration | **$100** | Wire protocol signals and portal into the existing app |
| 10 validation sessions | **$100** | User and developer recruitment, sessions, synthesis, report |
| Infrastructure | **$50** | Vercel + Upstash Redis free-tier overage / monitoring |
| **Total** | **$1,000** | **100% CKB** |

This is a product-completion project with a small validation component. It stays within the standard $1,000 Spark range; no $2,000 justification is requested.

If the Committee prefers a smaller first step, the priority order is:

1. Stable++ protocol-state signals.
2. Developer Portal v1.

---

## 8. Deliverables and how to verify

### Deliverables

1. **Stable++ adapter** with fixtures.
2. **Three live RUSD protocol signals:** collateral health, oracle health, redemption/withdrawal state.
3. **Dashboard + API integration** with evidence, confidence and coverage.
4. **`/developers` portal** with quickstart, API reference and examples.
5. **Self-serve hashed API keys** with revocation.
6. **Usage/rate limits** and quota panel.
7. **OpenAPI 3.1 contract** and **TypeScript SDK**.
8. **Tests** for the adapter, key hashing, auth, quota and revocation.
9. **10-session validation report** and public completion report.

### How to verify (no code review required)

- Open **https://secnev.vercel.app**, open RUSD, and inspect the three protocol signals and their evidence.
- Call `GET /api/v1/assets/{RUSD-id}` and check the JSON signals.
- Open **https://secnev.vercel.app/developers**, create a key, run the displayed curl command, see usage increase, then revoke the key and confirm `401`.
- Run the SDK example; it returns typed asset data.
- Run `npm test` locally for the adapter and key/rate-limit tests.
- Read the public validation report and completion report.
- Environment: Node 24+, public CKB RPC/Explorer; no wallet or private key.

**Acceptance standard:** a reviewer can verify the RUSD protocol signals and a successful authenticated API request in under **15 minutes** without reading the codebase.

---

## 9. Current state vs funded work

**Current state (already built, no Spark funds):**

- 10 CKB assets, live RPC/Explorer ingestion.
- 72/105 live signal instances; 33 unknown, with coverage disclosure.
- RUSD/USDI market price and liquidity from UTXOSwap pool cells.
- iCKB exchange rate/backing.
- Organic holder concentration, wallet exposure, real dCKB replay.
- Full cell scans, tests, dashboard, API and Vercel deployment.

**Funded delta (Spark):**

- Stable++ protocol-state adapter and three live RUSD signals.
- Developer Portal v1: `/developers`, keys, usage limits, OpenAPI, SDK.
- Dashboard/API integration.
- 10 validation sessions.
- Public validation and completion reports.

The existing risk engine, UI, alerting and data pipeline are not re-funded. Spark completes the product around them.

---

## 10. CKB alignment

- **Cell model:** the Stable++ adapter reads live cells, scripts and cell data directly; no EVM-style logs.
- **CKB-native primitives:** xUDT, type/lock scripts, UTXOSwap pool cells, iCKB Logic DAO cells, CKB Explorer/RPC.
- **Stable++:** RUSD is a CKB-native over-collateralized stablecoin; its vault/oracle state is the missing risk layer.
- **Ecosystem leverage:** the developer portal lets wallets, DEXs, issuers and data teams integrate CKB risk without rebuilding an indexer.
- **Public good:** Apache-2.0 code, CC BY 4.0 data, free API, no token, no paid scores, no sponsored rankings.
- **Open source:** all work merges into the existing public repository; the Committee can fork it into the Spark repository at completion.

---

## Posting checklist

- [ ] Add Discord username above.
- [ ] Confirm the GitHub repo is public and under the applicant account.
- [ ] Post in **Nervos Talk → `daos-funding` → `Spark Program`** with the title `Spark Program | secnev — CKB-native risk observatory`.
- [ ] Do **not** use the old `Spark-Program` tag; the sub-section is the current venue.
- [ ] Include the live demo and repo links.
- [ ] At approval, set up the multi-sig flow and publish the first weekly update.

---

## 中文摘要

secnev 是一个开源的 CKB 原生风险观测站。当前 MVP 已上线 10 个资产、72/105 个实时信号，RUSD/USDI 的 DEX 价格与流动性、iCKB 汇率与抵押率、钱包暴露、真实 dCKB 交易回放和 Vercel 演示均已可用。

本次 Spark 申请 **1,000 美元，100% 以 CKB 支付，周期 6 周**，在现有应用上补齐两个相互衔接的缺口：

1. **Stable++ 协议状态**：抵押率/TCR/CCR、预言机健康度、赎回/提现状态；
2. **Developer Portal v1**：`/developers`、自助 API Key、用量与限流、OpenAPI 3.1、TypeScript SDK；
3. 10 位真实用户/开发者验证。

现有风险引擎、Dashboard、告警和数据管道不重复申请。代码 Apache-2.0，数据 CC BY 4.0，免费 API，无代币、无付费评分、无赞助排名。
