# CKB / Nervos — Is there a Webacy equivalent?

Research note, 12 Nov 2026. Scope: onchain risk intelligence for the CKB/Nervos ecosystem — stablecoin/RWA ratings, vault ratings, wallet screening/KYT, token/contract risk, continuous monitoring.

## Short answer

**No.** There is no product in the CKB ecosystem with Webacy/DD.xyz's scope, and the major risk/compliance vendors do not cover CKB at all. The closest things are one **stalled grant proposal**, one **research-grade wallet-behaviour API**, the **CKB Explorer**, and a **testnet position-guardian demo**.

## Coverage check: who supports CKB?

| Vendor / product | CKB support | Evidence |
|---|---|---|
| **Webacy / DD.xyz** | ❌ No | Supported chains: eth, pol, opt, arb, base, robinhood, bsc, sol, ton, sei, sui, stellar, hedera, btc (limited), tron (limited). No CKB. |
| **Elliptic** | ❌ No | Sumsub coverage table: `Nervos — No`. |
| **Nominis** (74 chains) | ❌ No | Public chain list has no CKB/Nervos. |
| **Bitrace** (31 chains) | ❌ No | Supported blockchains table has no CKB. |
| **Merkle Science** | ❌ No | Supported chains list has no CKB. |
| **SlowMist MistTrack** (21+ chains) | ❌ No | Public coverage list has no CKB. |
| **TRM Labs** (185+ chains) | ❌ No evidence | No `/blockchain-coverage/ckb` page (404); not in published lists. |
| **GoPlus / Token Sniffer / De.Fi / Honeypot.is** | ❌ No | EVM + Solana (+ Sui for GoPlus); no xUDT/CKB. |
| **CertiK Skynet** | ⚠️ Token-level only | "Nervos Network" project page: partial rating 85.80 A, 1 audit (Apr 2020), 0 token/contract coverage, 0 monitored signals. |
| **CoinGecko / ZARQ / Token Vitals** | ⚠️ CKB token only | Market/asset risk (e.g. ZARQ B-, Token Vitals 6.6/10), not ecosystem DeFi risk. |
| **DefiLlama** | ❌ No CKB L1 | 423 chains, only "GodwokenV1" at $0; 452 stablecoins, none on Nervos/CKB. |

## What exists in/near CKB

### 1. Quantir — proposal only, not a product
- `[DIS] Quantir Risk Intelligence for CKB Ecosystem and Cross-Chain Monitoring`, CKB Community Fund DAO, **30 Apr 2026**, 7 posts, last activity **8 May 2026**, requested **$30k / 10 weeks**.
- Scope: CKB activity monitoring, xUDT flow anomalies, bridge/cross-chain, DeFi/liquidity signals, cell/contract anomalies, DAO fund flows, Fiber channel signals, API/WebSocket alerts with explanations.
- Status: discussion stage; **not in the funded-proposals list**; thread dormant. Quantir today supports **Ethereum, Base, Arbitrum only**; CKB is "actively working on".
- Implication: the intent exists, the product does not.

### 2. CKB Wallet Behaviour Intelligence (`ckb-intel`) — research, not risk intelligence
- Spark Program project (topic created 3 Jun 2026, active through late 2026), open-source at `github.com/FadhilMulinya/ckb-intel`.
- Cell-native feature extraction: 9 families (temporal, periodicity, topology, lifecycle, templates, scripts, typed assets, capacity, lineage), 12 descriptive behaviour rules, evidence/support states.
- Frozen dataset: 1,172 wallets, 47,145 participating txs, 196,308 inputs, 173,990 cells (Aug–Sep 2026).
- Public registry API at `api.afriai.xyz` (frozen analysis only, rate-limited); live arbitrary-wallet analysis still hardening (high-activity wallet timed out). Identity/bot classification was explicitly **withdrawn** as not scientifically established.
- No risk scores, no token/stablecoin/vault ratings, no compliance workflow.

### 3. CKB Explorer (Magickbase) — the data layer
- `explorer.nervos.org` + REST API (`mainnet-api.explorer.nervos.org`): blocks, transactions, cell inputs/outputs, addresses, sUDT/xUDT, holder allocation, NFT/Spore, DAO, RGB++, Fiber stats, market data.
- xUDT list supports tags `suspicious` and `invalid` — the only native "token risk" primitive, but curation/labelling, not scoring.
- No risk scores, alerts, wallet reputation, or entity labels.

### 4. CKB Position Guardian — demo
- `github.com/anihdev/CKB_DEFI_GUARDIAN` (Mar 2026): autonomous agent for **CKB testnet** lending positions; LTV/health factor, SAFE/WARNING/CRITICAL, Telegram alerts, simulated repay/rebalance, Fiber fee settlement.
- Narrow (one market, testnet, demo), not an intelligence platform.

### 5. Audits & dev security tooling
- **ScaleBit/BitsLab** audited iCKB, CKB Bitcoin SPV contracts, Quantum-Resistant Lock Script; covers CKB in its portfolio.
- **CertiK** audited Nervos in 2020 (chain-level).
- iCKB internal review (2026): 252 tests, 12M random + 37.8M combinatorial transactions; one known limit-order confusion issue.
- **ckb-adversary** (Spark proposal): replays ~30 generic attack families against real CKB scripts before deploy.
- **CKB Escrow Security Test Kit** (Spark proposal): Rust test suite for escrow scripts.
- These are point-in-time / pre-deploy tools, not continuous market or wallet risk.

## What is missing vs Webacy

| Capability | CKB status |
|---|---|
| Stablecoin/RWA letter ratings + peg monitoring | None. Stable++ RUSD is the main stablecoin; no independent score, tier, depeg alerting, reserve/backing analysis. |
| Vault ratings (iCKB, Nervos DAO, dCKB, MoniMkt, lending) | None. Audits exist, no composite score/listing verdict/withdrawal state. |
| Wallet screening / KYT / sanctions / fund-flow tracing | None. No vendor covers CKB. |
| Token risk (xUDT: mint authority, extensions, holder concentration, honeypot-like logic) | None. Only explorer `suspicious/invalid` tags. |
| Continuous monitoring + webhooks + alerts | None for CKB. |
| Historical incident registry / graveyard | None; incidents live in forum posts. |
| Agent-native rails (MCP/x402) | None. |

## Evidence the gap is real

- **dCKB drain (Aug–Oct 2026):** 201 deposits drained; 11.71M CKB out with only 600 dCKB burned; remaining 196 deposits (12.89M CKB + interest) claimed 18 Oct 2026 and cashed out through an instant swap to an exchange. dCKB now unbacked. No monitoring layer flagged it.
- **RGB++ forged-proof incident (15 Aug 2026):** per the ckb-adversary proposal, **16.59M CKB** taken from RGB++ cells with 1,464 forged Bitcoin proofs and **unnoticed for 80 days**.
- **iCKB limit-order confusion:** phantom orders can strand funds; mitigated client-side, not by monitoring.
- **Stable++/RUSD:** CDP stablecoin with oracle/liquidation/recovery-mode risk; no external rating or peg dashboard.
- **CKB DeFi is invisible externally:** DefiLlama has no CKB L1 TVL/stablecoin data, so even generic market-risk tooling cannot see it.

## Why the gap exists (structural)

1. **Cell/UTXO model, not accounts.** No EVM logs/events; risk features must be rebuilt from inputs, previous outputs, lock/type scripts, capacity and lineage.
2. **xUDT extensibility.** Token behaviour lives in extension scripts; "mint authority" is an owner lock hash, not an ERC-20 `owner()`.
3. **RGB++ / Bitcoin binding.** Assets have a Bitcoin-side leg; risk spans BTC UTXO + CKB cells + bridges (Rosen, Leap).
4. **Small, young DeFi surface.** Few stablecoins/vaults, thin TVL → weak commercial incentive for incumbents.
5. **Indexing cost.** A CKB-native indexer is the moat; Explorer API is the practical starting point but rate/latency-limited.

## If building a CKB-native equivalent (white space)

Minimum viable scope, in order of demand:
1. **RUSD peg + Stable++ vault health** (collateral ratio, oracle age/deviation, liquidation buffer, redemption) — a "DeFiLlama + Webacy" for the one stablecoin.
2. **iCKB / dCKB / Nervos DAO vault ratings** (audit, immutability, withdrawal liquidity, exchange-rate velocity, limit-order risk).
3. **xUDT token risk** (owner lock/mint capability, xUDT extension flags, supply cap, holder concentration, liquidity, deployer history).
4. **Wallet screening / behaviour** (cell-native features, taint from known exploit addresses, exchange/CEX labels, poisoning-style lookalikes).
5. **Monitoring + webhooks + API/MCP/x402**, plus a public incident registry.

Data sources: CKB node RPC + rich indexer, CKB Explorer API, RGB++/Fiber data, UTXOSwap/HueHub pools, Stable++/iCKB contracts, Rosen bridge events, oracle cells.

Distribution: CKB Eco Fund / Community Fund DAO grant; wallet integrations (JoyID, UTXO Global, Rei, CKBull); DEX pre-trade warnings; exchange listing DD; issuer dashboards.

Main risks: tiny addressable market, no ground-truth labels, indexer reliability, and the fact that "risk" for cell assets needs a new taxonomy rather than a port of EVM heuristics.

## Sources

- Webacy supported chains: https://docs.webacy.com/supported-blockchains
- Quantir proposal: https://talk.nervos.org/t/dis-quantir-risk-intelligence-for-ckb-ecosystem-and-cross-chain-monitoring/10218
- CKB Wallet Behaviour Intelligence: https://talk.nervos.org/t/spark-program-ckb-wallet-behaviour-intelligence/10338 ; https://github.com/FadhilMulinya/ckb-intel
- CKB Explorer API: https://ckb-explorer.readme.io/
- CKB Position Guardian: https://github.com/anihdev/CKB_DEFI_GUARDIAN
- dCKB post-mortem: https://talk.nervos.org/t/dckb-post-post-mortem-now-the-funds-are-gone/11016
- ckb-adversary: https://talk.nervos.org/t/spark-program-ckb-adversary-generic-attacks-on-real-ckb-transactions-before-you-deploy/11142
- iCKB review: https://talk.nervos.org/t/ickb-contracts-revisited-old-code-new-audit/10225
- Stable++ docs: https://stablepp.gitbook.io/stable++
- Elliptic coverage (Nervos: No): https://docs.sumsub.com/docs/elliptic
- CertiK Skynet Nervos: https://skynet.certik.com/projects/nervos
- DefiLlama API probe: 423 chains / 452 stablecoins, no Nervos/CKB.
