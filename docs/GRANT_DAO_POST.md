# [DIS] secnev — CKB-native risk observatory (working MVP, Phase 1)

**Request:** $36,000 equivalent in CKB, staged by milestone · **Duration:** 18 weeks
**Repo:** this repository · **Demo:** `npm install && npm run ingest && npm run dev` → `http://localhost:8787`
**License:** Apache-2.0 (code), CC BY 4.0 (data)

---

## One line

secnev is an open, CKB-native risk observatory: it scores stablecoins, vaults, xUDT/RGB++ tokens, scripts and wallets from cell-level data, publishes the evidence, and alerts the ecosystem before losses.

## Why CKB needs this

CKB has real assets but no independent risk layer.

- No Tier-1 vendor covers CKB: Elliptic's public table says `Nervos: No`; Nominis, Bitrace, Merkle Science and MistTrack do not list it; Webacy supports 13 chains and CKB is not one.
- DefiLlama has no CKB L1 TVL or stablecoin data (only deprecated Godwoken at $0).
- The dCKB drain (~24.6M CKB; dCKB is now unbacked) and the RGB++ forged-proof incident (16.59M CKB, unnoticed for 80 days, per the ckb-adversary proposal) show what the blind spot costs.
- Quantir's 2026 CKB proposal asked for $30k but never showed a public CKB prototype; it failed the discussion gate (17 likes) and died in May 2026.

The missing layer is CKB-native interpretation of cells, lock/type scripts, xUDT args, DAO/vault state, oracles and bridges.

## What already exists (built before this grant)

This is not a slide deck. The MVP runs on CKB mainnet today:

- CKB public RPC `get_cells` + CKB Explorer API ingestion.
- Cell → holder/lock aggregation with u128 LE amounts and known lock labels.
- xUDT args parser: owner lock hash, flags (`0x1FFFFFFF`, `0x20000000`, `0x40000000`, `0x80000000`), extensions.
- 10 assets: RUSD, iCKB, USDI, STB, Seal, AGENT, KOI, ccBTC, dCKB (incident), MoniMkt (testnet).
- **72/105 live signal instances, 33 unknown**, with `unknown` + coverage disclosure instead of invented numbers.
- **Live RUSD and USDI peg + liquidity from UTXOSwap pool cells** (no API key): RUSD ~26% off / ~$1,078 TVL; USDI ~67% off / ~$165 TVL; both ~30–40 days stale. Price, TVL, 1%-impact depth and staleness are published together.
- **Live STB, Seal and BTC liquidity** from UTXOSwap pool cells.
- **Live iCKB exchange rate + backing**: 1.2989 CKB/iCKB, 2,857,480.70 CKB of Logic DAO deposits, 2,199,999.92 iCKB supply.
- **Organic holder concentration**: Stable++ Intent Lock and UTXOSwap pool locks excluded; unresolved large holders capped at warn, not failed.
- **Wallet exposure screen**: lock label, balance, UDTs, recent counterparties, flagged-address exposure; taint stays `unknown`.
- **Real dCKB historical replay**: 3,464 transactions, full transaction details for candidate movements.
- **Full cell scans**: 0 page cap, 180s budget; Seal completes at 10,662 cells / 108 pages.
- 0–100 score, A+…F, ok/watch/warning/critical, confidence, ranked drivers with evidence.
- Dashboard, REST API, JSON methodology, tier-change/score-jump alerts, HMAC webhook + Telegram + SMTP email.
- 15 unit tests + headless browser smoke test.
- Public methodology v0.3.0 and incident registry (dCKB, RGB++, iCKB); empty registry → `unknown`.

## What Phase 1 adds (full product v1.0)

| Module | Scope |
|---|---|
| Stablecoin | RUSD, USDI + future pegged assets: peg, supply, redemption, collateral, oracle, reserves |
| Vault | iCKB, dCKB, Nervos DAO, MoniMkt, lending: withdrawal, exchange rate, oracle, collateral, curator |
| Token | xUDT/RGB++: mint authority, extensions, holders, liquidity, deployer, market integrity |
| Script | audit, admin/upgrade, known CKB bug classes, value at risk |
| Wallet | labels + counterparty exposure already live; cell-native behaviour, poisoning/lookalikes and taint in Phase 1 |
| Monitoring | public feed; webhook + Telegram + email already live, 3 attempts + per-channel delivery log |
| API | free REST + MCP server + embeddable badge |
| Registry | incidents, graveyard, freeze events |
| Reports | monthly public ecosystem risk report |

Coverage target: 100% of stablecoins/vaults above $100k TVL; top 100 xUDT/RGB++ tokens.

## Why us

- We built the MVP first: real mainnet cells, real xUDT parsing, real scores, tests.
- The code and methodology are CKB-native, with the official docs mirrored and cited (`docs/SOURCES.md`).
- We did not cross-post a generic proposal to other ecosystems.
- The work is public good: Apache-2.0 code, CC BY 4.0 data, no token, no paid scores.

## Budget and milestones

| # | Milestone | Weeks | Budget |
|---|---|---|---|
| M1 | Harden MVP: persistent incremental indexer, 15 assets, 15 signals, protocol-state groundwork, tests | 1–4 | $6,000 |
| M2 | Stablecoin + vault adapters (Stable++, MoniMkt, oracles, CR/TCR), pool discovery, 20+ signals | 5–9 | $12,000 |
| M3 | Token + wallet modules, taint/behaviour, MCP, embeddable badge | 10–14 | $10,000 |
| M4 | 100 assets, incident registry, monthly report, security review, handover | 15–18 | $8,000 |
| | **Total** | **18 weeks** | **$36,000** |

Payment: 20% upfront, then milestone-based. Every milestone report and transaction hash will be public.

## Verification

- `npm install && npm run ingest && npm run dev` runs the full stack.
- `npm test` covers grades, xUDT args, organic concentration, pool math, scoring, webhook signing and Telegram delivery.
- `npm run replay` pages 3,464 real dCKB transactions and fetches full details for candidate movements; curated context is included alongside it.
- The dashboard and API are public; every score shows coverage, confidence and evidence.
- Reviewers can run it locally in under 30 minutes.

## Public-good commitments

- Apache-2.0 code; CC BY 4.0 data.
- Free dashboard, free API, public methodology and changelog.
- No token, no paid scores, no sponsored rankings.
- No issuer influence; disclose grants and conflicts.
- Publish post-mortems for missed detections and false positives.

## Ask

1. Run the demo and challenge the methodology.
2. Introduce one design partner (issuer, wallet or DEX).
3. If this is useful, support the discussion-stage proposal (30 likes) so it can move to a vote.

---

## 中文摘要

secnev 是一个开源的 CKB 原生风险观测站：从 Cell、lock/type script、xUDT 参数、DAO/金库状态和预言机数据出发，为稳定币、金库、xUDT/RGB++ 代币、脚本和钱包打分，公开证据并在风险变化时告警。

目前 MVP 已在 CKB 主网上运行：10 个资产、真实链上数据、105 个信号实例中 64 个已上线、41 个明确标记为 unknown；RUSD 与 USDI 的价格和流动性直接读取 UTXOSwap 池 Cell（RUSD 约偏离锚定 26%、TVL 约 1,078 美元；USDI 约偏离 67%、TVL 约 165 美元；两个池都已约 30–40 天未交易）；STB/Seal/BTC 流动性、iCKB 汇率与抵押率、持有者集中度、钱包地址暴露、真实 dCKB 历史交易回放、全量 Cell 扫描、HMAC Webhook/Telegram/邮件告警均已实现。申请 36,000 美元等值 CKB，分 4 个里程碑、18 周完成完整产品：Stable++/MoniMkt 协议状态、代币与钱包 taint、MCP、100 个资产覆盖、事件库和月度公开报告。代码 Apache-2.0，数据 CC BY 4.0，无代币、无付费评分、无赞助排名。

欢迎运行 demo、挑战方法论，并介绍一个设计合作伙伴（发行方、钱包或 DEX）。
