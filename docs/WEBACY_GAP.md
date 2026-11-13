# secnev vs Webacy — core gap analysis

Purpose: choose the **smallest coherent Spark scope that makes secnev a complete product**, not a laundry list. Based on `research/webacy/PRODUCT_INTELLIGENCE.md` and the live docs corpus.

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
| **Stablecoin protocol state: collateral, oracle, redemption** | Core risk gap | High; RUSD market price without vault solvency is only half the answer | **Chosen** |
| **Developer portal: API keys, usage, docs, SDK** | Large, concrete | High; unlocks every existing signal to wallets/DEXs/issuers | **Chosen** |
| MCP server / x402 agent payments | Medium | Follow once the API contract is stable | Later |
| Wallet sanctions/poisoning/2-hop fund tracing | Large | High value, but CKB label/taint sources are thin; needs its own data work | Later |
| Transaction monitoring/simulation | Large | Needs tx simulation + policy engine; too big for $1k | Later |
| Stablecoin structural risk + Peg Canary | Medium/large | secnev has peg/liquidity; structural/reserve data needs more sources | Later |
| Vault V3 42-criteria framework | Large | CKB vault universe is small; iCKB is already covered | Later |
| RWA/yield/fund-flow analytics | Large | Not core CKB today | Later |
| Webhooks with delivery logs | Already covered by secnev | — | Done |
| Depeg alerts | Already covered by secnev | — | Done |

## Why this scope wins

The Spark ask is two sides of one product, not two unrelated features:

1. **Stable++ protocol state** answers: *Can RUSD recover or honour exits?* secnev already shows the market price; this adds collateral, oracle and redemption health.
2. **Developer Portal v1** answers: *How does a CKB wallet/DEX/issuer actually use this?* secnev already has the API; this adds keys, usage, OpenAPI and SDK.

Together they complete the loop:

```
market risk (already live)
      + protocol risk (Spark)
      + developer access (Spark)
      = a complete CKB stablecoin risk product
```

Everything is verifiable without code review:

- open RUSD and inspect the three protocol signals;
- open `/developers`, create a key, call the API, see usage, revoke the key;
- run the SDK example;
- read the validation and completion reports.

## Scope discipline

**In scope:** Stable++ adapter + three RUSD signals; `/developers` page; hashed API keys; revocation; usage/quota; rate limits; OpenAPI 3.1; TypeScript SDK; 10 validation sessions; public reports.

**Out of scope:** billing/tiers, MCP, x402, sanctions/taint, transaction monitoring, new assets, new risk categories beyond Stable++.

If the Committee wants a smaller first step, the priority order is:

1. Stable++ protocol-state signals.
2. Developer Portal v1.

The Spark application is in `docs/GRANT_SPARK.md`.
