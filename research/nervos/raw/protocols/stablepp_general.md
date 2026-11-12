> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/general.md).

# General

### What is Stable++?

Stable++ is the very first RGB++ based, over-collateralized stablecoin protocol to be used in conjunction with BTC and CKB, using BTC and CKB as collateral while USD-pegged stablecoin RUSD is minted in return, which leverages the leap function of RGB++, allowing assets transfer within the Bitcoin ecosystem freely.

With the powerful programmability and Turing completeness of CKB-VM, Stable++ is able to build over-collateralized vaults and efficient liquidation modules, ensuring a robust and secure stablecoin ecosystem.

### What can I do with Stable++ ?

At this stage:

1. Borrow RUSD against CKB or BTC by opening a vault
2. Redeem `1 RUSD` for `1 USD` worth of CKB/BTC

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2Fjwfe7Sweo9EAVKi99Vtd%2F02%20What%20can%20I%20do%20with%20Stable%2B%2B.png?alt=media&amp;token=73ac13a9-e413-4698-8fa0-455d3980e16d" alt=""><figcaption></figcaption></figure>

### Key features of Stable++

* Decentralized

  CKB-VM and CKB cell model fully supports running smart contracts. Once deployed, the contracts remain immutable and cannot be altered at any time by anyone. As a result, users can safely and confidently interact with Stable++, knowing that the integrity of the system is maintained.
* Modularized liquidation

  The liquidation mechanism runs automatically by the smart contracts ensuring that the liquidation process is efficient and minimizes losses, enhancing the overall stability and reliability of the Stable++ protocol.
* Capital efficiency

  Modularized liquidation mechanism allows the system to maintain a lower Minimum Collateral Ratio (`125%` for BTC and `130%` for CKB) without compromising stability and security. Thus borrowers can leverage their assets more effectively, requiring less collateral to access liquidity.

### Price stability

Stable++ utilizes a robust oracle service for USD:CKB/BTC price feed, ensuring that RUSD can always be redeemed for CKB/BTC at face value. Stable++ also treats RUSD as being equal to USD. Given that, RUSD can maintain its price within a reasonable range.

When the price of RUSD exceeds USD, any user or outside opportunist can borrow RUSD from Stable++ and sell it, decreasing the price.

Conversely, when the price of RUSD falls below USD, any user or outside opportunist can buy RUSD from DEXs and redeem BTC/CKB from Stable++, restoring the price to parity.

<figure><img src="https://1798157326-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTDrjUwcFcfiqhK4vVhCS%2Fuploads%2FSd2w89dRKSGqJh8KWwdb%2F03%20Price%20stability.png?alt=media&amp;token=4a2f4447-b552-4545-9298-5d4d394bdd46" alt=""><figcaption></figcaption></figure>

### Still cooking

To better enhance the ability and capability of Stable++, more features and functions are also undergoing and will be live very soon. These additions are designed to provide users with more options and benefits, ensuring a more robust and rewarding experience.

* Stability Pool: Providing RUSD to the Stability Pool in exchange for rewards from liquidation and support the Stability Pool Liquidation mechanism.
* Staking: Staking secondary token STB to earn the fee revenue paid for borrowing or redeeming RUSD
