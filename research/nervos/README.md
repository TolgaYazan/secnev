# Nervos / CKB documentation context

Mirrored 2026-11-12 for the secnev build. Primary sources are official; code prefers live on-chain data over static docs.

## What is here

| Path | Content |
|---|---|
| `raw/llms-full.txt` | Full Nervos CKB docs corpus (cell model, scripts, xUDT, DAO, RPCs, VM, wallets, AI resources) |
| `raw/llms.txt` | Docs index / entry points |
| `raw/explorer/*.md` | CKB Explorer API reference (addresses, transactions, cells, xUDTs, holder allocation, statistics, RGB++) |
| `raw/protocols/stablepp_*.md` | Stable++ docs: general, borrowing, liquidation, redemption, recovery mode, tokenomics, FAQ |
| `raw/protocols/ickb_readme.md` | iCKB contracts README (scripts, security, no admin keys) |
| `raw/protocols/ickb_audit.md` | iCKB executable security review (2026) |
| `raw/protocols/stablepp_site.html` | Stable++ app shell (for future API discovery) |

## Facts the code relies on

- **Cell model:** inputs consume live cells, outputs create new cells; each cell has capacity, lock script, optional type script, data. State = cell replacement, not account mutation.
- **xUDT args:** `<32-byte owner lock hash> <4-byte flags (LE)> <extension ScriptVec>`.
  - `0x1FFFFFFF` extension data present
  - `0x20000000` input-lock owner mode
  - `0x40000000` output-type owner mode
  - `0x80000000` input-type owner mode
- **Amounts:** first 16 bytes of cell data = u128 little-endian.
- **Address → script:** `@ckb-ccc/core`; script fingerprint = `hashCkb(Script.encode(script))`.
- **Public RPC:** `https://mainnet.ckb.dev/` (also `mainnet.ckbapp.dev`).
- **Explorer API:** `https://mainnet-api.explorer.nervos.org/api/v1/`.
- **Stable++:** RUSD CDP; MCR 125% BTC / 130% CKB; CCR 145% / 150%; redemption fee `amount × (baseRate + 0.5%)`, 12h half-life, 10% cap, 144 CKB minimum.
- **iCKB:** liquid NervosDAO token; iCKB Logic / Owned Owner / Limit Order scripts; immutable, no admin keys; ScaleBit 2024 + executable review 2026; known limit-order confusion issue.
- **dCKB:** legacy receipt token; drained Aug–Oct 2026; unbacked.
- **RGB++ forged proofs:** 16.59M CKB, 1,464 forged proofs, 80 days unnoticed (per ckb-adversary proposal).

## How secnev uses this

- `src/ckb/address.ts` — xUDT args parser, address→script, script hash.
- `src/ckb/rpc.ts` — `get_cells`, u128 parsing, holder/lock aggregation.
- `src/explorer.ts` — token metadata, supply, tags, holder lock distribution.
- `src/detectors.ts` — CKB-native signals and evidence.
- `docs/SOURCES.md` — per-fact citations.
