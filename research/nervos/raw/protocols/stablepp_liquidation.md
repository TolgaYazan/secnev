> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/liquidation.md).

# Liquidation

### **What are liquidations?**

Liquidations occur to ensure that the entire stablecoin supply remains fully backed by collateral. When a vault's Collateral Ratio falls below the MCR, it will be closed (liquidated).

During liquidation, the debt of the vault is canceled and managed accordingly. While the owner retains the full amount of RUSD borrowed, they will face a loss of its value overall.

#### Redistribution

Debts and collaterals of the under-collateralized vault would be redistributed proportionally across all existing vaults based on their collateral ratio.

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2FR252tFdkmvQFhyvEiONt%2F04%20Redistribution.png?alt=media&amp;token=10cf080c-de7c-4212-909e-73669d7daca9" alt=""><figcaption></figcaption></figure>

As shown in the chart, when Vault E’s CR drops below MCR, the debt and its collateral are proportionally redistributed to all the other vaults. This redistribution results in a slight decrease in the CR of the other vaults, but they also have a net gain from it.

### How do I prevent liquidation?

To prevent liquidation, ensure that your Individual Collateral Ratio (ICR) remains well above the Minimum Collateral Ratio. For added safety, aim to maintain your ICR above our recommended Collateral Ratio.

BTC vaults' recommended Collateral Ratio: 175%

CKB vaults' recommended Collateral Ratio: 180%
