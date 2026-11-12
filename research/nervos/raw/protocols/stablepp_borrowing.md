> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/borrowing.md).

# Borrowing

### Why do I want to use Stable++ for borrowing?

Stablecoins play a vital role in the cryptocurrency ecosystem due to their price stability over time. This consistency provides holders with peace of mind, knowing that their assets will maintain a steady value. Unlike most cryptocurrencies, which are prone to price volatility, stablecoins offer a safer investment option. As the first stablecoin issued for the RGB++ and Bitcoin ecosystem, RUSD stands as a reliable asset for your investment.

Stable++ protocol also offers capital efficiency brought by delicately designed liquidation mechanism.

### **How can I borrow with Stable++?**

To borrow you must open a vault and deposit a certain amount of collateral (CKB/BTC) to it. Then you can mint RUSD up to the MCR.

* Go to Stable++ official site
* Select the type of collateral you wish to deposit, either CKB or BTC
* Enter the amount of CKB or BTC you want to deposit into your vault and the amount of RUSD you want to mint (when opening a vault, minting amount must exceed 100 RUSD in order to prevent malicious activities)

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2Fi2EID4L0odmHnszHr2fz%2Fbefore%20borrowing.png?alt=media&amp;token=45d58c2a-2340-46d7-a931-b64080a77699" alt=""><figcaption></figcaption></figure>

* Click Mint button, sign the transaction and wait for execution
* As you successfully mint RUSD, your debt is also calculated out

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2FBFbGPJaJFByiAK6ivdMN%2Fafter%20borrowing.png?alt=media&amp;token=ca4936ed-7baa-4cd0-8e19-7301b8d1b763" alt=""><figcaption></figcaption></figure>

(The additional RUSD in debt is incurred due to borrowing fee and liquidation reserve. For more details, see ‘[Do I have to pay fees as a borrower?](#do-i-have-to-pay-fees-as-a-borrower)’)

* As you have fully access to your vault, now you can make adjustments to it
  * **Deposit More Collateral**: Increase your collateral to strengthen your position.
  * **Withdraw Abundant Collateral**: Withdraw excess collateral when your Collateral Ratio allows.
  * **Mint More RUSD**: Mint additional RUSD up to the Minimum Collateral Ratio (MCR).
  * **Repay Debt**: Repay your debt either partially or in full to reduce your liabilities.

### When do I need to pay back the loan?

Loans issued by the protocol do not have a repayment schedule. You can leave your vault open and repay your debt any time, as long as you maintain the ICR above MCR.

### How to close my vault and withdraw my collateral?

You can always click `Close Vault` button and fully repay your debt.

Debts need to pay and collaterals can be withdrawn will be automatically filled in.

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2FbM8CsO8tqhvfxEpmhVZQ%2Fclose%20vault.png?alt=media&amp;token=209bddd0-d0e5-4422-b82e-e4a2aad20e42" alt=""><figcaption></figcaption></figure>

### **Do I have to pay fees as a borrower?**

#### Borrowing fee

When minting RUSD, a fee of `1%` is charged and added to your debt. This fee covers the vault setup and ensures the smooth operation of your vault.

#### Liquidation reserve

A one-off fee of `10 RUSD` will be added to your debt as a liquidation reserve, regardless of the loan amount. This fee is intended to cover the gas cost if your vault is ever liquidated. While this slightly increases the actual collateral requirements, it is refundable if your vault is not liquidated. When you close your vault by fully repay the debt, this `10 RUSD` will be accounted for, and the corresponding amount of interest will be deducted.

#### Interest

Annual interest rate is set at a competitive `10%`, designed to ensure the sustainability of the system while providing you with the flexibility you need.

#### Aggregator node fee

To ensure decentralization, an intent-based model is utilized. For each transaction, aggregator nodes collect intent cells before submitting the transactions on-chain. A fee of approximately `650 CKB` is charged, which also serves as an incentive for the aggregator node.

### **What happens if my vault is liquidated?**

You lose your collateral as your debt is paid off through liquidation. i.e. you will no longer be able to retrieve your collateral by repaying your debt, but you still keep the full amount of the RUSD you have borrowed.
