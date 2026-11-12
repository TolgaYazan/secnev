> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/redemption.md).

# Redemption

### **What is Redemption?**

A redemption is the process of exchanging RUSD for CKB/BTC at face value, as 1 RUSD is exactly worth 1 USD in Stable++.

Users can redeem their RUSD for CKB/BTC at any time without limitations. However, a redemption fee will be charged on redemption. Note that the redeemed amount is taken into account for calculating the fee rate and have an impact on the redemption fee.

### Mechanism

When a redemption occurs, it means a user is exchanging RUSD for CKB/BTC. The RUSD provided by the redeemer goes into active Vaults in the system, as CKB/BTC collateral from these vaults is then transferred to the redeemer.

Although the vault owner faces a reduction in their collateral, there is no actual net loss for them, as the RUSD added to the vault increases the Collateral Ratio, vault owner’s debt is also deducted accordingly.

In essence, while the vault owner experiences a change in the composition of their vault, the overall value remains balanced.

### Why do I want to redeem from Stable++?

When the price of RUSD falls below USD, it is profitable to buy RUSD from DEXs and then redeem it for USD from Stable++. This process also has the positive side effect of increasing the price of RUSD, helping it return to parity with USD.

### **Do I have to pay fee as a redeemer?**

Yes, there is a redemption fee depend on the redemption volumes, and the frequency of how often the redemptions take place recently.

### How is the fee calculated?

```
redemptionFee = redeemedAmount * (baseRate + 0.5%) 
```

### How is the base rate calculated?

```
newBaseRate = RedeemedAmount / (totalDebtInPool * 2) + oldBaseRate
```

The `base Rate` increases with each redemption, and decays to 0 over time with a 12 hour half-life. Fee rate cannot become smaller than `0.5%` , which is added to `base rate`, protecting the redemption facility from being misused by arbitrageurs front-running the price feed. The redemption fee rate is also capped at `10%`. The `base rate` will also be updated to `old base rate` for the next redemption.

As a result, fee rate increase upon every redemption and decays over time as long as no redemptions occur. The intent is to deter large redemptions with higher fees.

### How do I redeem on Stable++

Our beta version Redemption tool is available on the Dashboard page of our website. Follow these simple steps to redeem with RUSD:

* Go to Stable++ official site, navigate to Redeem side bar.
* Input the amount of RUSD you wish to use on redemption.
* Select the collateral you want to redeem. Click Redeem button.

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2FTdket9g1txOf4bhTt0e6%2Fimage.png?alt=media&amp;token=43c722ad-df00-435c-ac6c-0f9c1a5bb935" alt="" width="375"><figcaption></figcaption></figure>

* The system will automatically calculate and display the estimated amount of collateral you will receive.
* An estimated redemption fee will also be shown. Please review it carefully.
* Click confirm button and submit the transaction.

#### Important Notes:

* A minimal redemption fee of `144 CKB` is required to submit the transaction. If the fee is too small to proceed, you may need to adjust the RUSD amount as the redemption fee increases with the redemption volume. For more details, refer to the section [How is the fee calculated?](#how-is-the-fee-calculated)
* The type of redeem fee asset depends on the type of collateral asset. In a CKB vault, the redeem fee is in WCKB (Wrapped CKB). The WCKB contract requires that the amount must equal the capacity to ensure seamless conversion between WCKB and CKB. On the CKB chain, there is a minimum cell size requirement - for WCKB cells, this minimum size is `144 CKB`. Therefore, the redeem fee must be greater than `144 CKB`.
* The fee is influenced by the overall frequency of redemptions by all users and the redemption amount. This will affect the redeemer's final gain. Always check the estimated fee before proceeding.

The price of RUSD slightly unpegging below $1 does not guarantee a profit on redemption. Please read through the document to have a thorough understanding and kindly take all necessary factors into consideration before taking action to avoid loss or risk.
