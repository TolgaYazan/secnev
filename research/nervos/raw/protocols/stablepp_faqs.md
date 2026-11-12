> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/faqs.md).

# FAQs

### Can I withdraw my collateral at any time?

Yes, you can. There is no withdraw limit or lock down durations. As long as you maintain your collateral ration above the MCR, you have full flexibility to access your funds whenever you need them.

### When will my vault face liquidation?

* When your vault’s Collateral Ratio drops below MCR.

While the Minimum Collateral Ratio set for BTC and CKB are `125%` and `130%`, it is recommended to keep your vault’s Collateral Ratio comfortably above our recommended Collateral ratio.

### Why do I need to pay aggregator nodes fee?

Aggregator nodes are to collect all cells created through an operation including borrowing, repaying, etc, and then submitting the transaction on chain. This is the fundamental logic of CKB solution which enhance the safety and stability.

The fee is given as a reward and incentive. Anyone can run an aggregator node and earn the reward, thereby guaranteeing a decentralized platform.

### Why does Stable++ require a minimum of 800 CKB reserved as gas fee?

The `800 CKB` covers the following:

**Aggregator Node Fee:** A portion of the reserve is allocated to the aggregator node as a fee for collecting intent cells and submitting the transaction on-chain. It is approximately `650 CKB`.

**Change Cell Creation:** The remainder of the reserve is used to create a change cell, if needed. This cost of `144 CKB` is totally refundable when the cell is spent.

Stable++ ensures a safe, truly decentralized and smooth transaction process.

### Why is my CKB converted in wCKB?

CKB is converted and wrapped into wCKB for enhanced transaction capabilities. When you close your vault, all your CKB collateral will be withdrawn into your wallet as wCKB. To convert your wCKB back into CKB, simply click the `Convert All wCKB` button.

### Why am I redeemed against?

When a redemption occurs, it means a user is exchanging RUSD for CKB/BTC. The RUSD provided by the redeemer goes into the vaults with the lowest Collateral Ratio, and the CKB/BTC collateral from these vaults is then transferred to the redeemer.

Redemption not only helps peg the price of RUSD but also improves the Total Collateral Ratio of the system.

Being redeemed against will not cause you any net loss. However, the best way to avoid being redeemed against is by maintaining a high Collateral Ratio relative to the other vaults in the system.
