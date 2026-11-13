# secnev vs Webacy — core gap analysis

Purpose: choose **one** Spark-sized deliverable, not a laundry list. Based on `research/webacy/PRODUCT_INTELLIGENCE.md` and the live docs corpus.

## Already covered by secnev

| Capability | secnev status |
|---|---|
| CKB cell-level ingestion | Live |
| Stablecoin peg/liquidity | Live for RUSD/USDI from UTXOSwap pool cells |
| Vault exchange rate/backing | Live for iCKB |
| Holder concentration | Live, organic exclusions |
| Wallet labels/counterparty exposure | Basic live screen |
| Alerts | Webhook + Telegram + email |
| Historical replay | Real dCKB transaction replay |
| Dashboard + public API | Live on Vercel |
| Open methodology/evidence | Live |
| Free/public good | Apache-2.0 + CC BY 4.0 |

## Webacy surfaces secnev lacks

| Webacy surface | Gap size | Fit for a $1k Spark | Verdict |
|---|---|---|---|
| **Developer portal: account, API keys, usage, tiers, docs, SDK** | Large, concrete | High; unlocks every existing risk signal to wallets/DEXs/issuers | **Chosen** |
| MCP server / x402 agent payments | Medium | Could follow once the API contract is stable | Later |
| Wallet sanctions/poisoning/2-hop fund tracing | Large | High value, but CKB label/taint sources are thin; needs its own data work | Later |
| Transaction monitoring/simulation | Large | Needs tx simulation + policy engine; too big for $1k | Later |
| Stablecoin structural risk + Peg Canary | Medium/large | secnev has peg/liquidity; structural/reserve data needs more sources | Later |
| Vault V3 42-criteria framework | Large | CKB vault universe is small; iCKB is already covered | Later |
| RWA/yield/fund-flow analytics | Large | Not core CKB today | Later |
| Webhooks with delivery logs | Already covered by secnev | — | Done |
| Depeg alerts | Already covered by secnev | — | Done |

## Why Developer Portal v1 wins

1. **It is the actual missing last mile.** secnev already has the data; external teams still cannot onboard, get a key, see limits, or use a typed client.
2. **It is exactly what Webacy ships as a product surface.** Webacy separates DD.xyz (app) from its Developer Portal (account, API key, usage, docs, SDK). secnev has the app but not the portal.
3. **It is narrow and verifiable.** A reviewer can open `/developers`, create a key, call the API, see usage, revoke the key, and run the SDK example — no code review required.
4. **It compounds every existing feature.** Pools, vaults, wallet exposure and alerts all become integrable.
5. **It fits 6 weeks and $1,000.** No new chain indexing, no transaction simulation, no billing system.

## Scope discipline

**In scope:** `/developers` page, hashed API keys, revocation, usage/quota, rate limits, OpenAPI 3.1, TypeScript SDK, 10 developer-validation sessions, public reports.

**Out of scope:** billing/tiers, MCP, x402, sanctions/taint, transaction monitoring, new risk detectors, new assets.

The Spark application is in `docs/GRANT_SPARK.md`.
