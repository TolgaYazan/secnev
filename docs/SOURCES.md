# Sources and factual basis

This project is engineered from the official CKB documentation and protocol sources. The local mirror is in `research/nervos/raw/` (Nervos docs `llms-full.txt`, CKB Explorer API pages, Stable++ pages, iCKB README/audit). Where a fact is version-sensitive, the code prefers live on-chain data over a static doc.

---

## CKB protocol

| Fact used in secnev | Source |
|---|---|
| Cell model: transaction consumes live cells as inputs and creates new cells as outputs; each cell has capacity, lock script, optional type script and data; state is cell replacement, not account mutation | https://docs.nervos.org/docs/ckb-fundamentals/cell-model · `llms-full.txt` |
| Lock script controls ownership; type script validates state rules; scripts validate transactions in CKB-VM; no persistent contract accounts | https://docs.nervos.org/docs/tech-explanation/script · https://docs.nervos.org/docs/tech-explanation/lock-script · https://docs.nervos.org/docs/tech-explanation/type-script |
| Capacity is storage; 1 CKB = 1 byte; minimum cell 61 CKB; xUDT cell 142 CKB (32-byte owner args + 16-byte amount) | https://docs.nervos.org/docs/tech-explanation/capacity · https://docs.nervos.org/docs/assets-token-standards/xudt |
| xUDT args: `<owner lock script hash> <4-byte flags (LE)> <extension ScriptVec>`; flags `0x1FFFFFFF` extensions, `0x20000000` input lock owner mode, `0x40000000` output type, `0x80000000` input type | https://docs.nervos.org/docs/ecosystem-scripts/xudt |
| xUDT type script deployed at `0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95` (`data1`) | https://docs.nervos.org/docs/ecosystem-scripts/xudt |
| Output locks are not executed during transaction validation — the class of bug behind limit-order confusion | https://docs.nervos.org/docs/ecosystem-scripts/xudt · iCKB audit |
| Public mainnet RPC endpoints: `https://mainnet.ckb.dev/`, `https://mainnet.ckbapp.dev/` | https://docs.nervos.org/docs/getting-started/rpcs · `llms-full.txt` |
| CKB address format (Bech32m, RFC 0021) | https://docs.nervos.org/docs/integrate-wallets/intro-to-wallets · https://github.com/nervosnetwork/rfcs |
| CKB Explorer API base: `https://mainnet-api.explorer.nervos.org/api/v1/`; endpoints `/xudts`, `/xudts/{type_hash}`, `/udts/{type_hash}/holder_allocation`, `/statistics` | https://ckb-explorer.readme.io · local `research/nervos/raw/explorer/` |

## Stable++ (RUSD)

| Fact | Source |
|---|---|
| Over-collateralized CDP stablecoin; BTC and CKB collateral; RUSD minted against them | https://stablepp.gitbook.io/stable++/general |
| Minimum collateral ratio: 125% BTC, 130% CKB (current docs) | https://stablepp.gitbook.io/stable++/general |
| Recovery mode CCR: 145% BTC, 150% CKB | https://stablepp.gitbook.io/stable++/recovery-mode |
| Redemption fee: `redeemedAmount × (baseRate + 0.5%)`; base rate rises with redemptions and decays with a 12-hour half-life; fee capped at 10%; minimum 144 CKB | https://stablepp.gitbook.io/stable++/redemption |
| Liquidation redistributes debt/collateral; stability pool and STB token | https://stablepp.gitbook.io/stable++/liquidation · https://stablepp.gitbook.io/stable++/tokenomics |
| RUSD on-chain type hash `0x71ff665b40ba044b1981ea9a8965189559c8e01e8cdfa34a3cc565e1f870a95c`, code hash `0x26a3…32b`, args `0x360c…9a7`, 8 decimals, `supply-unlimited` tag | CKB Explorer `/xudts?symbol=RUSD` (live, 2026-11-12) |
| RUSD/CKB pool: pool lock `0x393df3…9a88` (`type`), pool type hash `0xf680…da3b`, LP type hash `0xc2f5…8362`; live reserves 725.15095184 RUSD / 572,319.34944233 CKB; price ≈ $0.74 at CKB ≈ $0.00094; TVL ≈ $1,078; last pool tx 2026-10-13 | CKB RPC `get_cells` by pool lock; CKB Explorer `/udt_transactions/0xc2f5…8362`; CoinGecko `nervos-network` (all live, 2026-11-12) |
| USDI/CKB pool: pool lock args `0x51fd…adcb`, LP type hash `0x996c…d5e1`; live reserves 250.892328 USDI / 87,805.17928809 CKB; price ≈ $0.33; TVL ≈ $165; last pool tx 2026-10-03 | CKB RPC `get_cells` by pool lock; CKB Explorer `/udt_transactions/0x996c…d5e1`; CoinGecko (live, 2026-11-12) |
| STB/CKB, Seal/CKB, BTC/CKB pools: pool locks derived from the LP token owner hash; live reserves read from the pool cells | CKB RPC `get_cells`; CKB Explorer `/xudts?symbol=LP-UTXOSwap V1` + `/udt_transactions/{lp}` (live, 2026-11-12) |

## iCKB

| Fact | Source |
|---|---|
| Liquid NervosDAO token; deposit CKB, get iCKB, burn to withdraw from a mature deposit in the shared pool | https://github.com/ickb/contracts (README) |
| Three scripts: iCKB Logic, Owned Owner, Limit Order; no admin keys, no upgrades; code cells locked immutably | https://github.com/ickb/contracts (README) |
| ScaleBit audit 2024; executable review 2026; known limit-order confusion issue mitigated client-side | https://github.com/ickb/contracts · `ICKB-Audit-Report.md` · https://scalebit.xyz/reports/20240911-ICKB-Final-Audit-Report.pdf |
| iCKB type hash `0xd485c2271949c232e3f5d46128336c716f90bcbf3cb278696083689fbbcd407a`, args `0xb73b…e8 00000080` (input-type owner mode) | CKB Explorer `/xudts?symbol=iCKB` (live) |
| iCKB Logic code hash `0x2a8100ab5990fa055ab1b50891702e1e895c7bd1df6322cd725c1a6115873bd3` (`data1`, empty args); 24 NervosDAO deposits hold 2,857,480.70048793 CKB; iCKB supply 2,199,999.91970001; exchange rate 1.2988549112663481 CKB/iCKB | iCKB mainnet deployment migration `2024-09-12-151119.json`; CKB RPC `get_cells` by Logic lock; CKB Explorer `/xudts?symbol=iCKB` (live, 2026-11-12) |
| dCKB type hash `0xe78165e8b96ceea99bf93bdb86cb5b63d32c265045d674bc53da7e444bb31e1a`; 3,464 historical txs; 4.77M dCKB gross movement on 2026-11-07 and 2.32M on 2026-11-11 | CKB Explorer `/udts?symbol=dCKB` + `/udt_transactions/{typeHash}` + `/transactions/{hash}` (live, 2026-11-12) |

## dCKB incident

| Fact | Source |
|---|---|
| 201 deposits drained; 11.71M CKB out with only 600 dCKB burned; remaining 196 deposits (12.89M CKB + interest) claimed on 2026-10-18 and cashed out; dCKB now unbacked | https://talk.nervos.org/t/dckb-post-post-mortem-now-the-funds-are-gone/11016 |
| Root cause: dCKB scripts checked the transaction as a whole, not each deposit; one fresh deposit with a receipt unlocked many deposits | same |

## RGB++ forged-proof incident

| Fact | Source |
|---|---|
| 16.59M CKB taken from RGB++ cells with 1,464 forged Bitcoin proofs; unnoticed for 80 days; verification result checked for error but not validity | https://talk.nervos.org/t/spark-program-ckb-adversary-generic-attacks-on-real-ckb-transactions-before-you-deploy/11142 (proposal) |

## Ecosystem / market context

| Fact | Source |
|---|---|
| Elliptic does not support Nervos (`Nervos — No`) | https://docs.sumsub.com/docs/elliptic |
| Nominis supports 74 chains and does not list CKB | https://www.nominis.io/blockchains |
| Bitrace, Merkle Science, MistTrack do not list CKB | https://docs.bitrace.io/en/faq/support · https://docs.tracker.merklescience.com/reference/supported-blockchains · https://misttrack.io/crypto-glossary/Blockchain_Analytics.html |
| Webacy supports 13 chains and does not include CKB | https://docs.webacy.com/supported-blockchains |
| DefiLlama has no CKB L1 TVL/stablecoin data; only deprecated Godwoken at $0 | https://defillama.com/chains/nervos · DefiLlama API probe (2026-11-12) |
| Quantir's CKB proposal asked $30k; 17 likes, 273 views, dormant after 8 May 2026; not in the funded list | https://talk.nervos.org/t/dis-quantir-risk-intelligence-for-ckb-ecosystem-and-cross-chain-monitoring/10218 |
| CKB Community Fund DAO: 30 likes in one week to pass discussion; 100k CKB DAO deposit + 3× budget quorum + 51% yes to pass vote | https://talk.nervos.org/t/6874 |

---

## Notes on factual discipline

- The code uses **live on-chain data** for supply, holders, lock distribution, script fingerprints, five UTXOSwap pool reserves, and the iCKB Logic DAO balance. Static docs are used for protocol rules and definitions.
- When a fact is not available (AGENT/KOI/iCKB liquidity, Stable++ CR/TCR/oracle, MoniMkt positions, taint), the signal is `unknown`; the product does not infer or invent values.
- Wallet exposure uses `config/address_labels.json` plus CKB Explorer address/transaction endpoints; it is labels + counterparties, not a taint/KYC/AML determination.
- The RUSD pool observation is published with its last transaction age. A stale pool is a stale observation, not a fresh trade.
- The dCKB and RGB++ incident figures are labelled with their source. The `npm run replay` output is now real historical dCKB transaction data; the curated incident registry remains alongside it as context, not as the replay itself.
- The Stable++ MCR/CCR values are from the current public docs and can change; the adapter should read protocol state when integrated.
