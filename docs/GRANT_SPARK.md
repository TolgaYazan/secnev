# Spark Program | secnev Developer Portal

**Request:** **$1,000, 100% in CKB** · **Timeline:** 6 weeks · **Category:** developer tooling / public-good infrastructure
**Repository:** https://github.com/TolgaYazan/secnev · **Live app:** https://secnev.vercel.app

> Ready to post in **Nervos Talk → `daos-funding` → `Spark Program`**.
> The old `Spark-Program` tag is no longer required after the July 2026 forum change; the Spark Program sub-section is the current venue.

---

## 0. Title & tags

**Title:** `Spark Program | secnev Developer Portal`

**Venue:** Nervos Talk → `daos-funding` → `Spark Program`

**Tags:** none required. Do not use the old `Spark-Program` tag if the sub-section is selected.

---

## 1. Project overview

**Project name:** secnev Developer Portal

**One sentence:** A self-serve developer portal that turns secnev's CKB risk API into something a wallet, DEX, issuer or data team can integrate in under ten minutes — with API keys, usage limits, OpenAPI, a TypeScript SDK and live examples.

**Positioning:** developer tooling / API infrastructure / public-good distribution layer.

**Request:** $1,000, paid entirely in CKB, for a 6-week Developer Portal v1.

### Why this, and not another detector?

secnev already has the core risk intelligence:

- live CKB cell ingestion and 10 assets;
- RUSD/USDI pool price and liquidity;
- iCKB exchange rate/backing;
- organic holder concentration;
- wallet exposure;
- real dCKB replay;
- alerts, dashboard and API.

What it does **not** have is the Webacy-style **developer surface**: the place where an external team creates a key, reads the docs, makes a first request, sees usage and ships an integration. That is the missing last mile between “a good dashboard” and “infrastructure other CKB projects can build on.”

This Spark project deliberately does **one** thing: Developer Portal v1. No new risk modules, no re-funding the existing MVP.

The Webacy-vs-secnev comparison and the rejected alternatives are documented in `docs/WEBACY_GAP.md`.

---

## 2. Team profile

**Applicant:** Tolga Yazan — independent CKB-native engineer.

**Role:** API design, backend, developer experience, SDK and documentation.

**Background:** built the working secnev MVP before this application: live CKB RPC/Explorer ingestion, xUDT parsing, UTXOSwap pool-cell reads, iCKB Logic DAO exchange-rate/backing, wallet exposure, real dCKB transaction replay, tests, dashboard and Vercel deployment.

**GitHub:** https://github.com/TolgaYazan

**Project repository:** https://github.com/TolgaYazan/secnev

**Email:** capethcrazy@gmail.com

**Discord:** `<add your Discord username here>`

> The GitHub repository already exists under the applicant account. This is the identity-proof repository requested by the Spark Committee in the July 2026 update.

---

## 3. Project background

CKB has real assets but no independent risk layer. The dCKB drain (~24.6M CKB) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days) show the cost of that blind spot.

secnev already exposes the intelligence:

- **72/105 live signal instances; 33 unknown**, with coverage disclosure.
- The readable RUSD/CKB pool is **~26% off peg** with **~$1,078 TVL**; USDI is **~67% off** with **~$165 TVL**. Both are thin and stale, and the UI publishes that.
- iCKB exchange rate/backing: **1.2989 CKB/iCKB**.
- Wallet exposure, real dCKB replay, full cell scans, alerts and a Vercel deployment are working.

But a CKB wallet team, DEX, issuer or data analyst currently has to:

1. discover the dashboard;
2. guess the API shape from the browser;
3. call unauthenticated endpoints without quota or usage visibility;
4. write their own client and error handling;
5. ask the maintainer for help.

Webacy solved this with a developer portal: account, API key, usage, docs, SDK and examples. secnev needs the same **onboarding layer**, but free and open.

This is a distribution problem, not a data problem. It is exactly the kind of small, concrete, verifiable gap Spark is for.

---

## 4. Solution

Build **secnev Developer Portal v1** at `/developers` plus the API-key layer behind it.

### What a developer gets

1. **A five-minute quickstart**
   - `curl`, TypeScript and Python examples for asset risk, wallet exposure, pools and vaults.
2. **A self-serve API key**
   - Enter an email and label, receive a key once.
   - Keys are hashed at rest; the plaintext is never stored.
   - Revoke a key from the portal.
3. **Usage and limits**
   - Free tier: 10,000 requests/month, 5 req/s.
   - Anonymous access: 60 req/min per IP.
   - `X-secnev-Quota`, `X-secnev-Used` and `Retry-After` headers.
4. **An OpenAPI 3.1 contract**
   - Every public endpoint, response shape and error code.
   - Generated API reference on the portal.
5. **A small TypeScript SDK**
   - `createClient({ apiKey })` with typed methods:
     `assets.list()`, `assets.get(id)`, `pools.list()`, `vaults.list()`, `wallet.screen(address)`.
6. **Live examples**
   - Copy-paste requests with real RUSD/USDI/iCKB data.

### What this is not

- Not a paid tier or billing system.
- Not a token, KYC or AML product.
- Not another dashboard feature.
- Not MCP in this scope; MCP is a clean follow-up after the API contract is stable.

---

## 5. Technical approach

**Stack:** Node.js 24 + TypeScript, existing `node:sqlite` read-only snapshot, Vercel functions, Upstash Redis (free tier) for keys and usage counters, vanilla JS portal.

**Architecture:**

```
/developers (static portal)
        │
        ├─ POST /api/portal/key       create key (email + label)
        ├─ GET  /api/portal/usage     usage + quota
        └─ POST /api/portal/revoke    revoke key
                    │
             hashed key + counters
                    │
              Upstash Redis
                    │
/api/v1/*  ── auth + rate limit ──> existing risk API
```

**Key design decisions:**

- Keys are `sk_live_<random>`; only SHA-256 hashes are stored.
- `x-api-key` header; anonymous requests are allowed but IP-limited.
- Rate limits use Redis `INCR` + TTL windows.
- The portal is static, so it stays fast and cheap on Vercel Hobby.
- Portal endpoints are consolidated into one `/api/portal` function. The unused Vercel `/api/v1/assets/{id}/history` route is retired to keep the deployment at Hobby's 12-function limit; history remains in the local API.
- The existing read-only SQLite snapshot is untouched; keys and counters live in Redis.
- No private keys, no signing, no issuer-controlled ranking.

**OpenAPI/SDK:**

- One `openapi.json` is the source of truth for docs and the SDK.
- The SDK is a thin typed `fetch` wrapper with no runtime dependencies.
- Error handling: `401` invalid key, `403` revoked, `429` quota, `5xx` retry guidance.

---

## 6. To-do list

| Week | Work | Milestone |
|---|---|---|
| **1** | Write the OpenAPI 3.1 contract; define portal IA and quickstart content; freeze the public API shape | OpenAPI + portal outline |
| **2** | Implement hashed keys, Redis storage, key creation/revocation, auth + rate-limit middleware | Keys work end-to-end |
| **3** | Build `/developers` portal: quickstart, endpoint reference, key form, usage panel, copy-paste examples | Public portal live on preview |
| **4** | Build the TypeScript SDK and examples; add tests for hashing, auth, limits and revocation | SDK + tests pass |
| **5** | Deploy to production; run 10 developer-validation sessions with CKB wallet/DEX/issuer/data teams; fix onboarding friction | 10 sessions + issue list |
| **6** | Final docs, security pass, public validation report, completion report, handover | Spark completion package |

Each week ends with a verifiable artifact.

---

## 7. Required funding and breakdown

**Requested:** **$1,000 USD equivalent, 100% in CKB.**

CKB amount will be calculated at the Committee's approval-day rate. The request is denominated in USD so the scope is stable.

| Item | Amount | Purpose |
|---|---:|---|
| Portal backend + auth/usage | **$450** | Key hashing, Redis, rate limits, portal endpoints, tests |
| Docs + OpenAPI + TypeScript SDK | **$300** | Contract, API reference, quickstart, SDK, examples |
| Portal UI/UX | **$100** | `/developers` page, key form, usage panel, responsive polish |
| 10 developer-validation sessions | **$100** | Recruitment, sessions, synthesis, report |
| Infrastructure | **$50** | Vercel + Upstash Redis free-tier overage / monitoring |
| **Total** | **$1,000** | **100% CKB** |

This is a single-category developer-tooling project with a small validation component. It stays within the standard $1,000 Spark range; no $2,000 justification is requested.

---

## 8. Deliverables and how to verify

### Deliverables

1. **`/developers` portal** with quickstart, API reference and examples.
2. **Self-serve API keys** — create, display once, revoke.
3. **Usage + rate limits** — quota panel and headers.
4. **OpenAPI 3.1 contract** for all public endpoints.
5. **TypeScript SDK** with typed methods and examples.
6. **Tests** for key hashing, auth, quota, revocation and error codes.
7. **10-developer validation report** and public completion report.

### How to verify (no code review required)

- Open **https://secnev.vercel.app/developers**.
- Create a key with any email, copy it once.
- Run the displayed `curl` command; the response is real CKB risk data.
- Open the usage panel; the request count increases.
- Revoke the key; the same request returns `401`.
- Run the SDK example; it returns typed asset data.
- Read the public validation report and completion report.
- Run `npm test` locally for the key/rate-limit tests.
- Environment: Node 24+, public CKB RPC/Explorer; no wallet or private key.

**Acceptance standard:** a new developer can go from landing on `/developers` to a successful authenticated request in **under 10 minutes**, without reading the codebase.

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

- `/developers` onboarding portal.
- Hashed API keys + revocation.
- Usage metering + free-tier limits.
- OpenAPI 3.1 contract.
- TypeScript SDK.
- 10 developer-validation sessions.
- Public validation + completion reports.

This is a narrow, additive delta — not a re-funding of the existing risk engine.

---

## 10. CKB alignment

- **CKB-native data:** the API exposes cell-derived risk for CKB stablecoins, vaults, xUDT/RGB++ tokens and wallets.
- **Ecosystem leverage:** wallets, DEXs, issuers and data teams can integrate CKB risk without rebuilding an indexer.
- **Public good:** Apache-2.0 code, CC BY 4.0 data, free API, no token, no paid scores, no sponsored rankings.
- **Open source:** all work merges into the existing public repository; the Committee can fork it into the Spark repository at completion.
- **Web5 spirit:** lower the barrier for small CKB builders to use real risk intelligence, rather than forcing each team to become a data company.

---

## Posting checklist

- [ ] Add Discord username above.
- [ ] Confirm the GitHub repo is public and under the applicant account.
- [ ] Post in **Nervos Talk → `daos-funding` → `Spark Program`** with the title `Spark Program | secnev Developer Portal`.
- [ ] Do **not** use the old `Spark-Program` tag; the sub-section is the current venue.
- [ ] Include the live demo and repo links.
- [ ] At approval, set up the multi-sig flow and publish the first weekly update.

---

## 中文摘要

secnev 已经有可用的 CKB 风险数据、Dashboard 和公开 API，但缺少 Webacy 那样的 **开发者入口**：没有 API Key、用量限制、OpenAPI、SDK 和快速上手文档。外部钱包、DEX、发行方或数据团队要接入，只能自己猜接口、自己写客户端。

本次 Spark 申请 **1,000 美元，100% 以 CKB 支付，周期 6 周**，只做 **Developer Portal v1**：`/developers` 页面、自助 API Key（哈希存储、可撤销）、用量与限流、OpenAPI 3.1、TypeScript SDK、10 位开发者验证。现有风险引擎不重复申请。代码 Apache-2.0，数据 CC BY 4.0，免费 API，无代币、无付费评分、无赞助排名。
