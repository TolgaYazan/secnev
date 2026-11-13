# Spark Program | secnev — CKB-native risk observatory

**Request:** **$1,000, 100% in CKB** · **Timeline:** 6 weeks · **Category:** developer tooling / public-good infrastructure
**Repository:** https://github.com/TolgaYazan/secnev · **Live demo:** https://secnev.vercel.app

> Ready to post in **Nervos Talk → `daos-funding` → `Spark Program`**.
> The Spark-Program tag is no longer required after the July 2026 forum change; selecting the Spark Program sub-section is the current venue.

---

## 0. Title & tags

**Title:** `Spark Program | secnev — CKB-native risk observatory`

**Venue:** Nervos Talk → `daos-funding` → `Spark Program`

**Tags:** none required. Do not use the old `Spark-Program` tag if the sub-section is selected.

---

## 1. Project overview

**Project name:** secnev

**One sentence:** secnev is an open, CKB-native risk observatory that turns live cells, scripts, pools and protocol state into explainable risk scores for CKB stablecoins, vaults, tokens and wallets.

**Positioning:** developer tooling / public-good risk infrastructure / open API + dashboard.

**Request:** $1,000, paid entirely in CKB, to add the missing **Stable++ protocol-state module** and validate it with 10 real CKB users.

---

## 2. Team profile

**Applicant:** Tolga Yazan — independent CKB-native engineer.

**Role:** protocol/data engineering, cell indexing, detectors, API and dashboard.

**Background:** built the working secnev MVP before this application: live CKB RPC/Explorer ingestion, xUDT parsing, UTXOSwap pool-cell reads, iCKB Logic DAO exchange-rate/backing, wallet exposure, real dCKB transaction replay, tests and a Vercel deployment.

**GitHub:** https://github.com/TolgaYazan

**Project repository:** https://github.com/TolgaYazan/secnev

**Email:** capethcrazy@gmail.com

**Discord:** `<add your Discord username here>`

> The GitHub repository already exists under the applicant account. This is the identity-proof repository requested by the Spark Committee in the July 2026 update.

---

## 3. Project background

CKB has real assets but no independent risk layer. The dCKB drain (~24.6M CKB) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days, per the ckb-adversary proposal) show what the blind spot costs.

The current MVP already answers the market half of the question:

- 10 CKB assets scored from real mainnet cells.
- **72/105 signal instances live; 33 explicitly `unknown`**.
- The only RUSD/CKB pool we can read is **~26% off peg** with **~$1,078 TVL**; USDI is **~67% off** with **~$165 TVL**. Both pools are thin and ~30–40 days stale, and the dashboard publishes that staleness.
- iCKB exchange rate/backing is live: **1.2989 CKB/iCKB**, 2,857,480.70 CKB of Logic DAO deposits against 2,199,999.92 iCKB.
- Wallet exposure, real dCKB replay, full cell scans and Vercel deployment are working.

**The missing half is protocol solvency.** A DEX price can tell a user that RUSD is off peg, but it cannot tell them whether the Stable++ vault is solvent, whether the oracle is healthy, or whether withdrawals/redemptions are functioning. That is the gap this Spark project closes.

---

## 4. Solution

Add a **Stable++ protocol-state adapter** to secnev and validate it with real users.

Users will be able to open RUSD and see three protocol-level signals next to the existing market signals:

1. **Collateral health** — vault cells, total debt, collateral ratio, MCR/TCR/CCR, liquidation buffer.
2. **Oracle health** — oracle cell age, publisher/feed identity, deviation from the live DEX price.
3. **Redemption / withdrawal state** — redemption fee/base rate, pause state, and whether the protocol can honour exits.

Every new field is sourced from on-chain data. If a field is not publicly accessible or cannot be verified, it remains `unknown` with the reason published; nothing is invented.

The second deliverable is **10 user-validation sessions** with CKB depositors, wallet engineers and stablecoin users. The output is a public report: what they understood, what they distrusted, and which signal changed a decision.

**Difference from existing tools:** no Tier-1 analytics vendor covers CKB. DefiLlama has no CKB L1 stablecoin/TVL data. secnev is CKB-native from the cell up, and it publishes evidence, coverage and confidence rather than a black-box score.

---

## 5. Technical approach

**Stack:** Node.js 24 + TypeScript, native `node:sqlite`, CKB public RPC `get_cells`, CKB Explorer API, vanilla JS dashboard, Vercel static + serverless functions.

**Architecture:**

```
Stable++ vault/oracle cells ─┐
CKB RPC / Explorer ──────────┼─> adapter ─> detectors ─> score ─> API / dashboard
UTXOSwap RUSD pool ──────────┘                                      └─> evidence + coverage
```

**Key technical points:**

- Locate Stable++ vault, debt and oracle cells from deployed scripts/hashes.
- Decode cell data with the same little-endian/u128 and script-fingerprint utilities already used for xUDT and iCKB.
- Add `collateral_health`, `oracle_health` and `redemption_state` to the vault detector set.
- Keep the existing fail-closed rule: missing/stale data is `unknown`, never “safe”.
- Cross-check oracle price against the live RUSD/CKB pool; publish both, including the pool’s TVL and last-trade age.
- Add fixtures and tests so the adapter can be reviewed without a live wallet.

**What is explicitly out of scope:** no private keys, no transaction signing, no paid scores, no token, no issuer-controlled ranking.

---

## 6. To-do list

| Week | Work | Milestone |
|---|---|---|
| **1** | Map Stable++ vault/debt/oracle scripts and cell layouts; document every field and every unknown; create fixtures | Protocol map + fixture set |
| **2** | Implement the Stable++ adapter; add collateral, oracle and redemption signals; unit tests | Adapter merged; tests pass |
| **3** | Wire the new signals into the API and dashboard; deploy a preview; add evidence/coverage labels | Public preview with RUSD protocol state |
| **4** | Run 10 user-validation sessions (CKB depositors, wallet engineers, Stable++/iCKB users); record feedback | Validation notes + issue list |
| **5** | Fix the highest-impact issues; write integration docs and the public validation report | Docs + report |
| **6** | Final demo, completion report, reproducible verification, handover | Spark completion package |

No week is “continue development”; each week has a concrete, verifiable output.

---

## 7. Required funding and breakdown

**Requested:** **$1,000 USD equivalent, 100% in CKB.**

CKB amount will be calculated at the Committee’s approval-day rate. The request is denominated in USD so the scope is stable.

| Item | Amount | Purpose |
|---|---:|---|
| Protocol engineering | **$650** | Stable++ cell/oracle mapping, adapter, 3 signals, tests, deployment |
| User validation | **$200** | 10 sessions, incentives, synthesis, report |
| Infrastructure | **$50** | RPC/Explorer usage, Vercel, monitoring |
| Documentation / design | **$100** | Integration guide, public report, dashboard polish |
| **Total** | **$1,000** | **100% CKB** |

This is a single-category technical project with a small user-validation component. It is within the standard $1,000 Spark range; no special $2,000 justification is requested.

---

## 8. Deliverables and how to verify

### Deliverables

1. **Stable++ adapter** in the public repo, with fixtures.
2. **3 live RUSD signals:** collateral health, oracle health, redemption/withdrawal state.
3. **Dashboard + API** showing the new signals with evidence, confidence and coverage.
4. **10-user validation report** with feedback and decisions.
5. **Public completion report** comparing the plan with the delivered work.
6. **Reproducible deploy** on Vercel and local `npm run dev`.

### How to verify (no code review required)

- Open **https://secnev.vercel.app**, open RUSD, and inspect the three new signals and their evidence.
- Call `GET https://secnev.vercel.app/api/v1/assets/{RUSD-id}` and check the JSON signals.
- Run `npm test` and `npm run ingest` locally; fixtures make the adapter reproducible.
- Read the public validation report and completion report.
- Check the GitHub repository and the deployed commit.
- Environment: Node 24+, public CKB RPC/Explorer, no wallet or private key needed.

**Acceptance standard:** a reviewer can verify the three signals and the validation report in under 15 minutes without reading the full codebase.

---

## 9. Current state vs funded work

**Current state (already built, no Spark funds):**

- 10 CKB assets, live RPC/Explorer ingestion.
- 72/105 live signal instances; 33 unknown, with coverage disclosure.
- RUSD and USDI market price/liquidity from UTXOSwap pool cells.
- iCKB exchange rate/backing.
- Organic holder concentration, wallet exposure, real dCKB replay.
- Full cell scans, tests, dashboard, API, Vercel deployment.

**Funded delta (Spark):**

- Stable++ **protocol-state** adapter (vault/debt/oracle/redemption).
- 3 new RUSD signals integrated into the dashboard/API.
- 10 real user-validation sessions.
- Public validation + completion reports.

This is intentionally a narrow delta, not a re-funding of the existing MVP.

---

## 10. CKB alignment

- **Cell model:** the adapter reads live cells, scripts and cell data directly; no EVM-style logs.
- **CKB-native primitives:** xUDT, type/lock scripts, UTXOSwap pool cells, iCKB Logic DAO cells, CKB Explorer/RPC.
- **Stable++:** RUSD is a CKB-native over-collateralized stablecoin; its vault/oracle state is the missing risk layer.
- **Public good:** Apache-2.0 code, CC BY 4.0 data, no token, no paid scores, no sponsored rankings.
- **Open source:** all work is merged into the existing public repository; the Committee can fork it into the Spark repository at completion.

---

## Posting checklist

- [ ] Add Discord username above.
- [ ] Confirm the GitHub repo is public and under the applicant account.
- [ ] Post in **Nervos Talk → `daos-funding` → `Spark Program`** with the title `Spark Program | secnev — CKB-native risk observatory`.
- [ ] Do **not** use the old `Spark-Program` tag; the sub-section is the current venue.
- [ ] Include the live demo and repo links.
- [ ] Reply to Committee questions with concrete evidence, not generated claims.
- [ ] At approval, set up the multi-sig flow and publish the first weekly update.

---

## 中文摘要

secnev 是一个开源的 CKB 原生风险观测站。当前 MVP 已上线 10 个资产、72/105 个实时信号，RUSD/USDI 的 DEX 价格与流动性、iCKB 汇率与抵押率、钱包暴露、真实 dCKB 交易回放和 Vercel 演示均已可用。

本次 Spark 申请 **1,000 美元，100% 以 CKB 支付，周期 6 周**，只做一件明确的增量：补齐 **Stable++ 协议状态模块**（抵押率/TCR/CCR、预言机健康度、赎回/提现状态），并用 10 位真实用户验证。现有 MVP 不重复申请；资助范围是当前状态与交付物之间的差值。代码 Apache-2.0，数据 CC BY 4.0，无代币、无付费评分、无赞助排名。
