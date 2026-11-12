# Why the Quantir CKB proposal stalled — and whether we can build it

Post-mortem, 12 Nov 2026. Sources: Nervos Talk topic 10218 (full thread), CKB Community Fund DAO rules (topic 6874), funded-proposals list (topic 7793), RARI/IoTeX submissions, Quantir GitHub, app/landing status.

## Verdict

It stalled for **credibility and process reasons, not because the idea was bad or technically impossible**. The proposal never reached a vote. It failed the DAO's one-week popularity gate (17 likes vs 30 required), and the thread exposed that the team had no public CKB work, no working product in its repo, and was simultaneously submitting the same $30k proposal to other ecosystems.

That is actually good news for us: the demand is real, the incumbent is weak, and the failure mode is avoidable.

## What happened, precisely

| Date | Event |
|---|---|
| 8 Apr 2026 | Quantir GitHub account created; `quantir-risk-engine` repo created with 2 commits, described as "Public grant repository... focused on Uniswap and Balancer monitoring". No activity since. |
| 30 Apr 2026, 15:32 | Same $30k proposal posted to **RARI Foundation** (1 post, 2 likes, dead). |
| 30 Apr 2026, 15:40 | CKB Community Fund DAO `[DIS]` proposal posted ($30k, 10 weeks). |
| 4 May | Community challenges: repo is Uniswap/Balancer-only; "couldn't find [your implementations] via Google... only your other enquiries from the last 2 weeks about grants on other blockchains." |
| 4 May | Second challenge: "huge gap between UTXO-based and account-based... your main experience is EVM... hope you understand the difficulty of integration on CKB." |
| 4 May | Quantir replies: public repo is "early stage"; real work is "unpublished... MVP/closed beta"; will update repo "soon". No links, no demo. |
| 6 May | Asked for concrete xUDT monitoring examples. |
| 8 May | Reply lists generic signals (mint/burn, liquidity migration, holder concentration, bridge anomalies) with no cell-level method or data-source mapping. |
| 8 May | Thread dies. 17 likes total (10 on OP), 273 views, 7 posts. Never reaches 30 likes, never enters Metaforo vote, no committee review. |
| 11 May | Same proposal posted to IoTeX. |
| GitHub | Remaining repos are forks of **Polymesh** and **Movemaker** grant programs — the account is effectively a grant-application account. |
| Nov 2026 | Landing page returns `DEPLOYMENT_DISABLED`; app still loads, but no public CKB data/coverage. |

## The seven reasons, ranked

### 1. It failed the DAO's popularity gate (immediate cause)
DAO rules: a `[DIS]` proposal must collect **30 likes within one week** to pass the Discussion Stage. Quantir got **17 likes over 8 days**. For comparison, current CKB DAO proposals get **56–115 likes** (FiberNuts 56, CrowdCell 60, CKB IDL 70, Cellula 78, Pocket Node 115). It wasn't close, and it wasn't a timing fluke — the community simply didn't back it.

### 2. Credibility gap / grant-farming signal
The community did the diligence the proposal should have done:
- GitHub account created **3 weeks before** the proposal.
- The only "product" repo is a **2-commit stub** with no engine, despite claims of "live collectors, transaction monitoring, alert delivery".
- The same $30k document went to **RARI (8 minutes earlier)** and **IoTeX (11 days later)**; the account also carries Polymesh/Movemaker grant-program forks.
- No team profile, no CKB contributors, no local partner, no letters of support.

This is the single most damaging factor. Once the thread framed it as "grant farming", the 30-like gate was unwinnable.

### 3. It couldn't answer the only technical question that mattered
CKB's cell/UTXO model is the whole difficulty. The community asked twice for concrete CKB mechanics: how do you identify suspicious xUDT events, reconstruct cells, handle lock/type scripts, RGB++ leap, Fiber, bridge flows? The answers were EVM-shaped generalities ("abnormal mint/burn", "wallet clustering", "liquidity shock") with no data sources, no cell reconstruction, no prototype, no sample output.

For a monitoring product, "we'll adapt our EVM engine" is not a plan — it's the risk.

### 4. Wrong funding ladder
CKB has a deliberate ladder:
- **Spark Program**: $1,000 default (up to $2,000), 1–2 months, prototype/validation, 20% upfront, weekly syncs.
- **Community Fund DAO**: larger budgets, but requires community traction, 30 likes, 100k CKB DAO deposit, Metaforo vote.

Quantir skipped Spark, had no CKB prototype, and asked the DAO for **$30k / 10 weeks**. The ecosystem was simultaneously funding a CKB-native researcher (CKB Wallet Behaviour Intelligence) at Spark scale. The contrast was obvious.

### 5. DAO quorum math penalises large asks
Under the rules: 30 likes in a week → 100,000 CKB in Nervos DAO to open the vote → quorum of **3× the requested CKB budget** → 51% yes. A $30k ask implies a very large CKB quorum (at ~$0.001/CKB, roughly 90M CKB — a huge share of the ~194M CKB remaining treasury), while typical Metaforo turnout has historically been ~25–35M CKB. So even if it had passed discussion, a $30k ask faced a structurally high turnout bar. Smaller, staged asks are easier to pass.

### 6. No visible CKB constituency
Risk infrastructure is a public good with no immediate user. The proposal named "developers, ecosystem operators, dashboards" — nobody with budget or urgency. There were no design partners, no issuer/wallet/DEX asking for it. Later incidents (dCKB drain, RGB++ forged proofs) proved the need, but they came after the proposal died.

### 7. Market timing and scope
CKB DeFi is small: one main stablecoin (RUSD), a handful of vaults (iCKB, dCKB, Nervos DAO, MoniMkt), thin DEX liquidity. A 10-week, $30k, multi-signal monitoring platform is a lot of platform for a small surface. The DAO funds concrete, community-visible deliverables; a generic monitoring API is hard to justify without a named consumer.

## Can we build it?

**Yes — and the failure is a blueprint for what not to do.** The technical work is tractable if scoped to CKB-native primitives rather than "port Webacy".

### Principle: build first, grant second
Quantir asked for money to discover whether it could do CKB. We should do the opposite: ship a small public CKB-native proof, then ask for scale.

### Recommended wedge (pick one, not all)
1. **RUSD / Stable++ health** — collateral ratio, oracle age/deviation, liquidation buffer, redemption fees, peg. One issuer, clear customer, obvious dashboard.
2. **iCKB / dCKB / Nervos DAO vault ratings** — audit status, immutability, withdrawal liquidity, exchange-rate velocity, limit-order risk. dCKB's collapse is the case study.
3. **xUDT token risk for DEXs/wallets** — owner lock/mint capability, xUDT extension flags, supply cap, holder concentration, liquidity, deployer history. Sell to UTXOSwap/HueHub/JoyID/UTXO Global.
4. **Wallet screening / cell-native behaviour** — taint from exploit addresses, exchange labels, lookalike/poisoning patterns. Hardest to monetise early; best as a later module.

### 6-week MVP (self-funded or Spark)
- **Indexer**: CKB node RPC + rich indexer; reconstruct inputs → previous outputs → created cells, lock/type scripts, capacity, lineage. Store normalized cells/txs.
- **3 detectors only**:
  1. Stablecoin peg + supply + redemption velocity (RUSD).
  2. Vault withdrawal/liquidity + exchange-rate velocity (iCKB/dCKB).
  3. xUDT mint-authority/extension/holder-concentration risk.
- **One public dashboard** (asset list + detail + score + drivers) and **one API endpoint + webhook**.
- **One retro-detection**: replay dCKB or the RGB++ forged-proof window and show the alert that would have fired.
- Publish repo, methodology, and a 3-minute demo. This is the artifact that gets 30+ likes.

### 90-day plan
- Weeks 1–2: indexer + data model; pick 10 assets; define 15 signals (not 400 factors).
- Weeks 3–4: scoring + dashboard; recruit 3 design partners (Stable++, iCKB, a wallet/DEX).
- Weeks 5–6: API/webhook + retro-detection; public launch post with demo.
- Weeks 7–8: Spark application ($1–2k) or self-funded iteration; collect usage evidence and testimonials.
- Weeks 9–12: DAO proposal with traction, 3 partners, staged milestones, and a CKB-denominated budget sized for quorum. Or CKB Eco Fund direct if the wedge is strategic.

### Pitch checklist (to avoid the stall)
- Public repo with real commits **before** the proposal; link to a live demo.
- Name the CKB primitives: cells, lock/type scripts, xUDT flags, RGB++ leap, Rosen/Fiber. Show one worked example.
- One ecosystem only. Do not cross-post the same deck to RARI/IoTeX/Polymesh.
- One named customer/design partner, with a quote or LOI.
- Budget in CKB, staged (20% upfront, milestone releases), sized to clear 3× quorum.
- Ask for Spark-scale money first; graduate to DAO.
- Answer the "why you" question with CKB commits, not a company description.
- Post in English + Chinese; engage the community before submitting.

### Honest risks
- **Market size**: CKB DeFi is tiny; a pure SaaS risk platform may not cover its costs. Plan for grant/public-good funding plus paid API for exchanges/wallets, not a venture-scale business on day one.
- **Data quality**: no ground-truth labels; cell reconstruction is the hard part; Explorer API latency/limits.
- **Incumbent**: Quantir could revive; a well-funded analytics vendor could add CKB. Speed and CKB-native depth are the moat.
- **Scope creep**: do not build 400 factors. Build the 15 signals that map to actual loss events (dCKB, RGB++ proofs, oracle/liquidation, mint authority).

## Bottom line

The proposal stalled because the community didn't trust the team and the team couldn't demonstrate CKB-native capability — then the DAO's 30-like gate killed it before any committee review. The idea is still open, the need is now proven by real losses, and the bar to beat is low: **a working CKB-native demo with three credible detectors and one design partner** would be more than Quantir ever showed.

Build the demo first. Then ask for money.
