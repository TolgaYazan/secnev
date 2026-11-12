> For the complete documentation index, see [llms.txt](https://stablepp.gitbook.io/stable++/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://stablepp.gitbook.io/stable++/recovery-mode.md).

# Recovery mode

Recovery Mode kicks in when the Total Collateral Ratio (TCR) of the system falls below Critical Collateral Ratio (CCR). CCR set for BTC and CKB vaults are `145%` and `150%`.

### What will happen during recovery mode?

During Recovery Mode, Vaults with a collateral ratio below Minimum Collateral Ration (MCR) will still be liquidated.

System blocks borrower transactions that would further decrease the TCR. New RUSD may only be issued by adjusting existing vaults in a way that improves their collateral ratio, or by opening a new Vault with its Collateral Ration above CCR.

The borrowing fee will be adjusted to `0%` to better encourage users to borrow RUSD.

### Recommendation

As the Individual Collateral Ratio (ICR) of each Vault receiving collateral and debts from liquidated Vaults will slightly decrease, maintaining a relatively higher ICR is recommended for optimal safety.
