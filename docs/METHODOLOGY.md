# secnev Methodology — v0.3.0

Status: public draft. Version: `0.3.0`. The code and this document are the contract; changes require a version bump.

---

## 1. Scope

secnev assesses **CKB-native entities**:

- stablecoins (RUSD, USDI, future pegged assets)
- vaults (iCKB, dCKB, Nervos DAO, MoniMkt, lending markets)
- xUDT / RGB++ tokens
- scripts (lock/type scripts)
- wallets (labels + counterparty exposure; taint/AML is Phase 2)

The framework is built on the CKB cell model: transactions consume live cells as inputs and create new cells as outputs; each cell carries capacity, a lock script, an optional type script, and data. Risk is derived from observable cell state and script behaviour, not from EVM-style logs.

---

## 2. Conventions

| Concept | Convention |
|---|---|
| Risk score | `0–100`, **higher = worse** |
| Letter grade | `A+` best (lowest risk) → `F` worst |
| Tier | `ok` <25 · `watch` 25–49 · `warning` 50–69 · `critical` ≥70 |
| Confidence | `high` / `medium` / `low`, derived from signal coverage |
| Coverage | `live signals / total signals` |
| Freshness | `last_observed_at`, `stale` flag |
| Unknown | `status: "unknown"`, `score: null` — excluded from the weighted score, reduces coverage |
| Organic supply | scanned supply minus holders whose lock is labelled `protocol` or `dex` in `config/labels.json` |

### Grade bands

| Grade | Max score | Grade | Max score |
|---|---|---|---|
| A+ | 5 | C+ | 56 |
| A | 12 | C | 66 |
| A- | 20 | C- | 77 |
| B+ | 28 | D | 88 |
| B | 37 | F | 100 |
| B- | 46 | | |

Bands are tighter at the safe end and widen as risk rises.

---

## 3. Scoring

```
known signals  = signals with score != null
category_score = Σ(signal.score × weight) / Σ(weight of known signals)
risk_score     = clamp(category_score + hard floors, 0, 100)
```

- Missing signals are dropped and weights renormalised; coverage falls.
- If no signal is known, the score is `50` with `low` confidence (not “safe”).
- Drivers are ranked by `score × weight`; zero-contribution signals are not shown as drivers.

### Hard floors

| Condition | Floor |
|---|---|
| Asset manually classified as unbacked (dCKB) | 95 |
| Any curated incident with a loss | 85 |
| Active stablecoin depeg (`peg_deviation` fail) | 70 |
| Manual testnet status (MoniMkt) | 50 |

Hard floors ensure a catastrophic state cannot be averaged away.

### Confidence

| Coverage | Confidence |
|---|---|
| ≥ 75% | high |
| ≥ 45% | medium |
| < 45% | low |

Partial cell scans reduce confidence for holder-concentration signals.

---

## 4. Weights

### Stablecoin

| Signal | Weight |
|---|---|
| Peg deviation | 15% |
| Peg persistence | 10% |
| Cross-venue spread | 5% |
| Supply reconciliation | 10% |
| Mint authority | 10% |
| Redemption velocity | 10% |
| Liquidity depth | 10% |
| Holder concentration | 5% |
| xUDT extensions | 5% |
| Supply cap | 5% |
| Incident history | 5% |
| Admin / script change | 5% |
| Script audit | 5% |

### Vault

| Signal | Weight |
|---|---|
| Withdrawal availability | 20% |
| Exchange-rate velocity | 10% |
| Admin / script change | 10% |
| Script audit | 10% |
| Holder concentration | 5% |
| Supply reconciliation | 5% |
| Incident history | 10% |
| Oracle health | 10% |
| Collateral health | 5% |
| Mint authority | 5% |
| Supply cap | 5% |
| Liquidity depth | 5% |

### Token

| Signal | Weight |
|---|---|
| Holder concentration | 15% |
| Mint authority | 20% |
| xUDT extensions | 10% |
| Supply cap | 10% |
| Supply reconciliation | 5% |
| Liquidity depth | 10% |
| Deployer history | 5% |
| Incident history | 5% |
| Admin / script change | 5% |
| Redemption velocity | 5% |
| Market integrity | 5% |
| Script audit | 5% |

---

## 5. Signal definitions

### Stablecoin

1. **Peg deviation** — `|price − 1|`. `≥0.5%` warn, `≥2%` fail, score = `deviation/5% × 100`. If no price source, `unknown`.
2. **Peg persistence** — two consecutive observations more than 0.5% off peg → warn.
3. **Cross-venue spread** — needs at least two independent price sources; otherwise `unknown`.
4. **Supply reconciliation** — sum of live cells vs Explorer-reported supply. `≥2%` mismatch → warn. Partial scan → `unknown`.
5. **Mint authority** — reads xUDT type-script args:
   - `supply-unlimited` tag + owner lock → warn (65).
   - owner lock hash present, unresolved to a verified multisig/timelock → warn (50).
   - iCKB: pass — supply is controlled by the audited iCKB Logic script, no admin keys.
6. **Redemption velocity** — supply change between observations at least 1h apart. `≤−2%` (redemption) or `≥+5%` (mint spike) → warn.
7. **Liquidity depth** — reads configured pool cells directly (no API key). Live pairs: RUSD/CKB, USDI/CKB, STB/CKB, Seal/CKB, BTC/CKB. TVL `< $10k` → fail (95), `< $50k` → warn (75), otherwise pass (10). The signal also publishes the pool address, reserves, 1%-impact depth, and the age of the last pool transaction. No configured pool → `unknown`.
8. **Holder concentration (organic)** — top-10 share of **organic** scanned supply. Locks labelled `protocol` or `dex` in `config/labels.json` are excluded (Stable++ Intent Lock, UTXOSwap pool lock). Raw top-10 share is still published as evidence.
   - `≥40%` → warn; `≥60%` → warn; `≥80%` → fail **only** when the largest organic holder is a confirmed non-protocol whale/market maker.
   - If the largest organic holder is an unresolved wallet, the signal is capped at warn: the holder may be a treasury, market maker or protocol-controlled wallet. This avoids false failures.
   - If all scanned supply is held by labelled protocol/DEX locks, the signal is `unknown`.
9. **xUDT extensions** — flags:
   - `0x1FFFFFFF` extension data → warn.
   - `0x40000000` / `0x80000000` owner-mode paths → warn, except iCKB, where `0x80000000` is part of the immutable iCKB Logic design → pass.
   - plain 32-byte args → pass.
10. **Supply cap** — `supply-limited` tag → pass; `supply-unlimited` → warn.
11. **Incident history** — curated incidents in `config/incidents.json`. A loss → fail; known non-loss issue → warn. An empty registry is `unknown`, **not** a pass: absence of a record is not evidence of absence.
12. **Admin / script change** — compares `codeHash:hashType:args` across runs. Change → fail (95). A baseline stores `fingerprint`; a comparison stores `current`, which is carried forward so a pass does not reset to unknown on the next run.
13. **Script audit** — `config/audits.json`. Audited → pass; no audit → warn.

### Vault

14. **Withdrawal availability** — dCKB is manually unbacked → fail. For iCKB, the pool balance and iCKB supply are live evidence, but individual NervosDAO deposit maturity is not yet modelled → `unknown`. MoniMkt remains testnet.
15. **Exchange-rate velocity** — for iCKB, `exchangeRate = iCKB Logic DAO CKB / iCKB supply`. First observation is a baseline (`unknown`); then `≤ −1%` → fail (90), `≥ +2%` → warn (70), otherwise pass.
16. **Oracle health** — Stable++/MoniMkt oracle cells are not integrated → `unknown`. iCKB has no price oracle; its exchange rate is protocol-derived → `unknown` with that explanation.
17. **Collateral health** — for iCKB, `backingRatio = CKB deposits / iCKB supply`; `<1` → fail (95), `<1.05` → warn (60), otherwise pass. Stable++ CR/TCR/MCR and MoniMkt positions are still Phase 1.

### Token

18. **Deployer history** — serial deployer / prior flags; unknown.
19. **Market integrity** — wash trading / volume anomaly; unknown until DEX trade history is integrated.

### Wallet exposure

20. **Lock label** — the address lock is resolved to the local label registry (SECP256K1, JoyID, OMNI, Nostr, Stable++ Intent Lock, UTXOSwap pool lock, RGB++). Unlabelled locks → warn.
21. **Counterparty exposure** — recent address transactions are parsed for counterparties; flagged/incident addresses → fail, more than five unlabelled counterparties → warn, otherwise pass.
22. **Taint** — `unknown` by design. secnev does not claim taint, KYC or AML coverage without a taint source.

### Historical replay

23. **dCKB replay** — pages the Explorer's 3,464 dCKB transactions, finds candidate movements, then fetches the full transaction detail for each candidate (the UDT view omits change outputs) and aggregates net and gross daily movement. This is real historical transaction data, not a curated timeline. The curated incident registry remains as context.

### Manual assets

Manual assets (dCKB, MoniMkt) use curated facts with sources. dCKB is floored to 95 because the 2026 drain left it unbacked; MoniMkt is floored to 50 because it is a testnet deployment without an external audit.

---

## 6. CKB-specific evidence

- **Cell amount** — first 16 bytes of cell data as little-endian u128 (`parseU128LE`).
- **Holder identity** — lock script key `codeHash:hashType:args`; labels come from `config/labels.json` (SECP256K1, JoyID, OMNI Lock V2, Nostr, Stable++ Intent Lock, UTXOSwap pool lock, RGB++ lock).
- **Organic exclusion** — a holder whose lock is labelled `protocol` or `dex` is removed from the organic denominator; the raw share is still reported.
- **xUDT args** — `ownerLockHash = args[0:32]`; flags = little-endian u32 at bytes 32–36. If args are exactly 32 bytes, there are no flags.
- **Script fingerprint** — `hashCkb(Script.encode(lock/type script))` via `@ckb-ccc/core`.
- **Pool reserves** — read live cells by the pool lock (UTXOSwap pool lock code hash `0x393df3…`). The pool lock args are the LP token's 32-byte owner hash. Base reserve = u128 in cells whose type hash equals the base asset; CKB quote reserve = capacity of untyped cells. Price = `quoteReserve × quoteUsd / baseReserve`. Live pairs: RUSD/CKB, USDI/CKB, STB/CKB, Seal/CKB, BTC/CKB.
- **iCKB vault** — the iCKB Logic lock (`0x2a8100ab…`, data1, empty args) holds NervosDAO deposits. `exchangeRate = sum(capacity) / iCKB supply`; `backingRatio = exchangeRate`.
- **Cell scan** — `get_cells` with `script_type: "type"`, 100 cells/page, **0 page cap by default**, bounded by a 180s time budget. An empty page ends the scan; a budget-limited scan is `partial`. Seal completes at 10,662 cells / 108 pages in ~43s.

---

## 7. Data sources and freshness

| Data | Source | Cadence |
|---|---|---|
| Cells / holders / supply | CKB public RPC `get_cells` | per ingest |
| Token metadata / tags / reported supply | CKB Explorer API | per ingest |
| CKB USD price | CoinGecko | 5 min cache |
| RUSD/USDI/STB/Seal/BTC price + liquidity | live UTXOSwap pool cells (`config/pools.json`) | per ingest |
| Last pool transaction | CKB Explorer `/udt_transactions/{lp_type_hash}` | per ingest |
| iCKB exchange rate / backing | iCKB Logic DAO cells + Explorer iCKB supply (`config/vaults.json`) | per ingest |
| Wallet labels / counterparties | `config/address_labels.json` + CKB Explorer address/tx endpoints | per request |
| Other asset prices | manual `config/prices.json`, CoinGecko, optional UTXOSwap API | per ingest |
| Audits | `config/audits.json` (curated) | manual |
| Incidents | `config/incidents.json` (curated, sourced) | manual |
| Historical replay | CKB Explorer `/udt_transactions` + `/transactions/{hash}` | on demand |
| Alert delivery | HMAC webhook, Telegram, SMTP email; 3 attempts + per-channel delivery log | per alert |

Staleness: a score is stale after 48 hours without a new observation.

---

## 8. Known limitations (v0.3.0)

1. Full scans are bounded by a 180s budget, not a fixed page cap. Seal completes at 10,662 cells / 108 pages; extremely large future assets may still be `partial`.
2. Peg/liquidity are live for five assets. AGENT, KOI and iCKB have no configured pool, so their liquidity is `unknown`.
3. The live pools are thin and stale: RUSD ~$1.1k TVL / ~30 days since last trade; USDI ~$164 TVL / ~40 days. The UI publishes the age and depth; a stale pool is a stale market observation, not a fresh trade.
4. Stable++ CR/TCR/oracle and MoniMkt positions still need protocol-state adapters. iCKB exchange rate/backing are live.
5. No DEX trade history / wash-trading analysis; cross-venue spread needs a second venue.
6. Wallet screening is labels + counterparty exposure; taint/AML is `unknown` without a taint source.
7. The dCKB replay uses real transactions and full transaction details, but does not yet rebuild every NervosDAO deposit behind the drain.
8. Telegram and SMTP email are implemented; they require operator credentials and are skipped when unconfigured.

---

## 9. Change log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-12 | Initial public methodology: 13 stablecoin, 14 vault, 12 token signals; CKB cell-based aggregation; hard floors. |
| 0.2.0 | 2026-11-12 | Organic holder concentration with protocol/DEX lock exclusions; live UTXOSwap RUSD/CKB pool price and liquidity; empty incident registry → unknown; iCKB owner-mode flag → pass; admin fingerprint persists across runs; HMAC webhook delivery. |
| 0.3.0 | 2026-11-12 | USDI/STB/Seal/BTC pool price + liquidity; iCKB exchange rate and backing; wallet labels/counterparty exposure; real dCKB historical transaction replay; full cell scans (0 page cap); Telegram + SMTP email delivery with per-channel logs. |
