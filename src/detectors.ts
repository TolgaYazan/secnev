import { createRequire } from "node:module";
import { config } from "./config.js";
import type {
  AssetDef,
  CellSummary,
  Signal,
  SignalStatus,
} from "./types.js";
import { parseXudtArgs } from "./ckb/address.js";
import type { ExplorerUdt } from "./explorer.js";
import type { PoolSnapshot } from "./pools.js";
import type { VaultSnapshot } from "./vaults.js";

const require = createRequire(import.meta.url);
const audits = require("../config/audits.json") as Record<
  string,
  {
    audited: boolean;
    firms: string[];
    lastAudit: string | null;
    executableReview?: string;
    notes?: string;
  }
>;
const incidents = require("../config/incidents.json") as Record<
  string,
  Array<{
    id: string;
    date: string;
    category: string;
    mechanism: string;
    loss: string;
    status: string;
    summary: string;
    links: string[];
  }>
>;

export interface PreviousState {
  snapshot?: {
    ts: number;
    supply: string | null;
    priceUsd: number | null;
    exchangeRate?: number | null;
  };
  signals?: Signal[];
}

export interface DetectorContext {
  asset: AssetDef;
  explorer: ExplorerUdt | null;
  cells: CellSummary;
  supply: bigint;
  priceUsd: number | null;
  priceSource: string | null;
  pool?: PoolSnapshot | null;
  vault?: VaultSnapshot | null;
  previous?: PreviousState;
  now: number;
}

function sig(
  id: string,
  name: string,
  status: SignalStatus,
  score: number | null,
  confidence: Signal["confidence"],
  evidence: Record<string, unknown>,
  reason: string,
): Signal {
  return { id, name, status, score, confidence, evidence, reason };
}

function unknown(
  id: string,
  name: string,
  reason: string,
  evidence: Record<string, unknown> = {},
): Signal {
  return sig(id, name, "unknown", null, "low", evidence, reason);
}

function pct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function usd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function runDetectors(ctx: DetectorContext): Signal[] {
  const {
    asset,
    explorer,
    cells,
    supply,
    priceUsd,
    priceSource,
    pool,
    vault,
    previous,
  } = ctx;
  // Prefer live type-script data over the static registry.
  const liveType = explorer?.attributes.type_script ?? null;
  const liveArgs = liveType?.args ?? asset.args;
  const args = parseXudtArgs(liveArgs);
  const tags = explorer?.attributes.xudt_tags ?? asset.tags ?? [];
  const supplyUnlimited = tags.includes("supply-unlimited");
  const supplyLimited = tags.includes("supply-limited");
  const audit = audits[asset.symbol];
  const assetIncidents = incidents[asset.symbol] ?? [];

  const signals: Signal[] = [];

  // 1. Peg deviation
  if (asset.kind === "stablecoin") {
    if (priceUsd == null) {
      signals.push(
        unknown(
          "peg_deviation",
          "Peg deviation",
          "No reliable price source is configured for this asset; peg is unknown, not safe.",
          { priceSource },
        ),
      );
    } else {
      const dev = Math.abs(priceUsd - 1);
      const status: SignalStatus =
        dev >= config.thresholds.pegFailPct / 100
          ? "fail"
          : dev >= config.thresholds.pegWarnPct / 100
            ? "warn"
            : "pass";
      const poolAgeHours =
        pool?.lastPoolTxAt != null
          ? (ctx.now - pool.lastPoolTxAt) / 3_600_000
          : null;
      const thin = pool?.tvlUsd != null && pool.tvlUsd < 10_000;
      signals.push(
        sig(
          "peg_deviation",
          "Peg deviation",
          status,
          Math.min(100, Math.round((dev / 0.05) * 100)),
          thin ? "low" : "high",
          {
            priceUsd,
            pegUsd: 1,
            deviationPct: dev * 100,
            source: priceSource,
            poolTvlUsd: pool?.tvlUsd ?? null,
            poolDepth1pctUsd: pool?.depth1pctUsd ?? null,
            lastPoolTxAt: pool?.lastPoolTxAt ?? null,
            lastPoolTxAgeHours: poolAgeHours,
          },
          `Price ${priceUsd.toFixed(6)} is ${(dev * 100).toFixed(2)}% from $1.${
            thin ? " The source pool is thin (<$10k TVL); treat this as an indicative market price." : ""
          }${
            poolAgeHours != null
              ? ` Last pool transaction ${poolAgeHours.toFixed(1)}h ago.`
              : ""
          }`,
        ),
      );
    }
  }

  // 2. Peg persistence
  if (asset.kind === "stablecoin") {
    const prev = previous?.snapshot;
    if (prev?.priceUsd == null || priceUsd == null) {
      signals.push(
        unknown(
          "peg_persistence",
          "Peg persistence",
          "Needs at least two price observations; none available yet.",
        ),
      );
    } else {
      const prevOff = Math.abs(prev.priceUsd - 1) >= 0.005;
      const nowOff = Math.abs(priceUsd - 1) >= 0.005;
      signals.push(
        sig(
          "peg_persistence",
          "Peg persistence",
          prevOff && nowOff ? "warn" : "pass",
          prevOff && nowOff ? 60 : 0,
          "medium",
          {
            previousPriceUsd: prev.priceUsd,
            currentPriceUsd: priceUsd,
            previousTs: prev.ts,
          },
          prevOff && nowOff
            ? "Price has been more than 0.5% off peg across two observations."
            : "No sustained off-peg pattern across the last two observations.",
        ),
      );
    }
  }

  // 3. Cross-venue spread
  if (asset.kind === "stablecoin") {
    signals.push(
      unknown(
        "cross_venue_spread",
        "Cross-venue spread",
        "Only one price source is integrated; cross-venue spread cannot be measured.",
        { priceSource },
      ),
    );
  }

  // 4. Supply reconciliation
  if (explorer && cells.cellCount > 0) {
    const reported = BigInt(explorer.attributes.total_amount || "0");
    const onChain = cells.totalAmount;
    if (cells.partial) {
      signals.push(
        unknown(
          "supply_reconciliation",
          "Supply reconciliation",
          "Cell scan was capped before the full supply was read; reconciliation is incomplete.",
          { scannedCells: cells.cellCount, pages: cells.pages },
        ),
      );
    } else if (reported > 0n) {
      const diff = onChain > reported ? onChain - reported : reported - onChain;
      const ratio = Number((diff * 1_000_000n) / reported) / 1_000_000;
      signals.push(
        sig(
          "supply_reconciliation",
          "Supply reconciliation",
          ratio >= 0.02 ? "warn" : "pass",
          ratio >= 0.02 ? 70 : 0,
          "high",
          {
            explorerSupply: reported.toString(),
            onChainSupply: onChain.toString(),
            mismatchPct: ratio * 100,
          },
          ratio >= 0.02
            ? `On-chain cells differ from the Explorer-reported supply by ${pct(ratio)}.`
            : "On-chain cells reconcile with the Explorer-reported supply.",
        ),
      );
    } else {
      signals.push(
        unknown(
          "supply_reconciliation",
          "Supply reconciliation",
          "No reported supply to compare against.",
        ),
      );
    }
  } else {
    signals.push(
      unknown(
        "supply_reconciliation",
        "Supply reconciliation",
        "No cell data available for reconciliation.",
      ),
    );
  }

  // 5. Mint authority / owner lock
  if (asset.source === "explorer") {
    if (asset.symbol === "iCKB") {
      signals.push(
        sig(
          "mint_authority",
          "Mint authority",
          "pass",
          5,
          "high",
          {
            ownerLockHash: args.ownerLockHash,
            flags: args.flags,
            ownerMode: args.ownerMode,
            audit: "iCKB Logic mints/burns against pool deposits; no admin keys, immutable scripts.",
          },
          "iCKB supply is controlled by the audited iCKB Logic script, not an admin key.",
        ),
      );
    } else if (!args.ownerLockHash) {
      signals.push(
        unknown(
          "mint_authority",
          "Mint authority",
          "Type-script args do not expose an owner lock hash; mint authority is unresolved.",
          { args: liveArgs },
        ),
      );
    } else {
      signals.push(
        sig(
          "mint_authority",
          "Mint authority",
          supplyUnlimited ? "warn" : "warn",
          supplyUnlimited ? 65 : 50,
          "medium",
          {
            ownerLockHash: args.ownerLockHash,
            flags: args.flags,
            ownerMode: args.ownerMode,
            supplyUnlimited,
          },
          supplyUnlimited
            ? "Owner-controlled mint with no on-chain supply cap (supply-unlimited tag)."
            : "Owner-controlled mint; the owner lock is a hash and is not resolved to a verified multisig/timelock.",
        ),
      );
    }
  } else {
    signals.push(
      unknown(
        "mint_authority",
        "Mint authority",
        "Manual/off-chain asset; mint authority is not modelled.",
      ),
    );
  }

  // 6. Redemption / supply velocity
  if (asset.source === "explorer") {
    const prev = previous?.snapshot;
    if (!prev?.supply || ctx.now - prev.ts < 60 * 60_000) {
      signals.push(
        unknown(
          "redemption_velocity",
          "Redemption velocity",
          "Needs two supply observations at least one hour apart.",
        ),
      );
    } else {
      const before = BigInt(prev.supply);
      if (before <= 0n) {
        signals.push(
          unknown(
            "redemption_velocity",
            "Redemption velocity",
            "Previous supply was zero.",
          ),
        );
      } else {
        const delta =
          Number(((supply - before) * 1_000_000n) / before) / 1_000_000;
        const status: SignalStatus =
          delta <= -0.02 ? "warn" : delta >= 0.05 ? "warn" : "pass";
        signals.push(
          sig(
            "redemption_velocity",
            "Redemption velocity",
            status,
            status === "warn" ? 70 : 0,
            "medium",
            {
              previousSupply: before.toString(),
              currentSupply: supply.toString(),
              changePct: delta * 100,
              hours: (ctx.now - prev.ts) / 3_600_000,
            },
            status === "warn"
              ? `Supply changed ${(delta * 100).toFixed(2)}% since the previous snapshot.`
              : "No anomalous net mint/burn since the previous snapshot.",
          ),
        );
      }
    }
  } else {
    signals.push(
      unknown(
        "redemption_velocity",
        "Redemption velocity",
        "Manual/off-chain asset; no supply history.",
      ),
    );
  }

  // 7. Liquidity depth
  if (pool?.tvlUsd != null) {
    const tvl = pool.tvlUsd;
    const status: SignalStatus =
      tvl < 10_000 ? "fail" : tvl < 50_000 ? "warn" : "pass";
    const ageHours =
      pool.lastPoolTxAt != null
        ? (ctx.now - pool.lastPoolTxAt) / 3_600_000
        : null;
    signals.push(
      sig(
        "liquidity_depth",
        "Liquidity depth",
        status,
        status === "fail" ? 95 : status === "warn" ? 75 : 10,
        pool.partial ? "low" : "high",
        {
          source: pool.source,
          poolAddress: pool.poolAddress,
          tvlUsd: pool.tvlUsd,
          depth1pctUsd: pool.depth1pctUsd,
          baseReserve: pool.baseReserve,
          quoteReserve: pool.quoteReserve,
          baseDecimals: pool.baseDecimals,
          quoteDecimals: pool.quoteDecimals,
          lastPoolTxAt: pool.lastPoolTxAt,
          lastPoolTxAgeHours: ageHours,
        },
        `${
          tvl < 10_000
            ? `Pool TVL is ${usd(tvl)}; exit liquidity is critically thin.`
            : tvl < 50_000
              ? `Pool TVL is ${usd(tvl)}; exit liquidity is thin.`
              : `Pool TVL is ${usd(tvl)}.`
        }${
          ageHours != null
            ? ` Last pool transaction ${ageHours.toFixed(1)}h ago.`
            : ""
        }`,
      ),
    );
  } else {
    signals.push(
      unknown(
        "liquidity_depth",
        "Liquidity depth",
        "No configured DEX pool for this asset; liquidity depth is unknown.",
        { priceSource },
      ),
    );
  }

  // 8. Holder concentration (organic: labeled protocol/DEX locks excluded)
  if (cells.holderCount >= 5 && cells.totalAmount > 0n) {
    const holders = cells.holders;
    const excluded = holders.filter((h) => h.excludeFromOrganic);
    const organic = holders.filter((h) => !h.excludeFromOrganic);
    const excludedAmount = excluded.reduce((acc, h) => acc + h.amount, 0n);
    const organicTotal = cells.totalAmount - excludedAmount;
    const rawTop10 = holders
      .slice(0, 10)
      .reduce((acc, h) => acc + h.share, 0);

    if (organicTotal <= 0n || organic.length === 0) {
      signals.push(
        unknown(
          "holder_concentration",
          "Holder concentration",
          "All scanned supply is held by labeled protocol/DEX locks; organic concentration is undefined.",
          {
            rawTop10Share: rawTop10,
            excludedShare: Number(excludedAmount) / Number(cells.totalAmount),
            holderCount: cells.holderCount,
            partial: cells.partial,
          },
        ),
      );
    } else {
      const organicTop10 =
        organic.slice(0, 10).reduce((acc, h) => acc + Number(h.amount), 0) /
        Number(organicTotal);
      const top = organic[0]!;
      const topShare = Number(top.amount) / Number(organicTotal);
      const excludedShare = Number(excludedAmount) / Number(cells.totalAmount);
      const topLabel = top.lockName ?? "unresolved lock";
      const attribution =
        top.labelKind === "whale" || top.labelKind === "market_maker"
          ? "confirmed non-protocol"
          : top.labelKind === "protocol" || top.labelKind === "dex"
            ? "labeled protocol/DEX"
            : top.labelKind === "wallet"
              ? "wallet, ownership unresolved"
              : "unresolved";

      let status: SignalStatus =
        organicTop10 >= config.thresholds.top10Extreme
          ? "fail"
          : organicTop10 >= config.thresholds.top10Fail
            ? "warn"
            : organicTop10 >= config.thresholds.top10Warn
              ? "warn"
              : "pass";

      // A high share is only a hard fail when we can attribute the holder to a
      // non-protocol whale. Otherwise it is a warning: the large holder may be
      // a treasury, market maker, or protocol-controlled wallet.
      if (status === "fail" && attribution !== "confirmed non-protocol") {
        status = "warn";
      }

      const score =
        status === "fail"
          ? 95
          : status === "warn"
            ? Math.min(80, Math.round(55 + Math.max(0, organicTop10 - 0.4) * 50))
            : 0;

      signals.push(
        sig(
          "holder_concentration",
          "Holder concentration",
          status,
          score,
          cells.partial ? "low" : "medium",
          {
            top10Share: rawTop10,
            rawTop10Share: rawTop10,
            organicTop10Share: organicTop10,
            excludedShare,
            topHolder: top.lockKey,
            topHolderShare: topShare,
            topHolderLabel: topLabel,
            topHolderKind: top.labelKind,
            attribution,
            holderCount: cells.holderCount,
            organicHolderCount: organic.length,
            scannedCells: cells.cellCount,
            partial: cells.partial,
          },
          `Top 10 organic holders control ${pct(organicTop10)} of scanned supply${
            excludedShare > 0
              ? ` after excluding ${pct(excludedShare)} held by labeled protocol/DEX locks`
              : ""
          }. Largest organic holder is ${topLabel} with ${pct(topShare)}; ${attribution}.${
            status === "warn" && organicTop10 >= config.thresholds.top10Extreme
              ? " Capped at warn because non-protocol ownership is not confirmed."
              : ""
          }`,
        ),
      );
    }
  } else {
    signals.push(
      unknown(
        "holder_concentration",
        "Holder concentration",
        "Fewer than five holders/cells were resolved.",
        { holderCount: cells.holderCount },
      ),
    );
  }

  // 9. xUDT extensions / owner-mode flags
  if (asset.source === "explorer" && asset.symbol !== "KOI") {
    if (asset.symbol === "iCKB") {
      signals.push(
        sig(
          "xudt_extensions",
          "xUDT extensions",
          "pass",
          5,
          "high",
          {
            flags: args.flags,
            hasExtensions: args.hasExtensions,
            ownerMode: args.ownerMode,
            design: "iCKB Logic uses the xUDT input-type owner-mode flag by design.",
          },
          "iCKB's xUDT owner-mode flag is part of its immutable Logic design; no extension scripts are present.",
        ),
      );
    } else {
      const risky =
        args.hasExtensions ||
        args.ownerMode.outputType ||
        args.ownerMode.inputType;
      signals.push(
        sig(
          "xudt_extensions",
          "xUDT extensions",
          risky ? "warn" : "pass",
          risky ? 60 : 0,
          "high",
          {
            flags: args.flags,
            hasExtensions: args.hasExtensions,
            ownerMode: args.ownerMode,
          },
          risky
            ? "xUDT args enable extension scripts or non-default owner-mode paths; review the extension code."
            : "Plain xUDT args; no extension scripts or unusual owner-mode flags.",
        ),
      );
    }
  } else {
    signals.push(
      unknown(
        "xudt_extensions",
        "xUDT extensions",
        asset.symbol === "KOI"
          ? "Legacy sUDT, not xUDT; extension flags do not apply."
          : "No on-chain type script for this asset.",
      ),
    );
  }

  // 10. Supply cap
  if (asset.source === "explorer") {
    signals.push(
      sig(
        "supply_cap",
        "Supply cap",
        supplyLimited ? "pass" : supplyUnlimited ? "warn" : "unknown",
        supplyLimited ? 0 : supplyUnlimited ? 55 : null,
        "high",
        { tags },
        supplyLimited
          ? "Token is tagged supply-limited."
          : supplyUnlimited
            ? "Token is tagged supply-unlimited."
            : "No supply-cap tag found.",
      ),
    );
  } else {
    signals.push(
      unknown("supply_cap", "Supply cap", "Manual/off-chain asset."),
    );
  }

  // 11. Incident history
  if (assetIncidents.length > 0) {
    const worst = assetIncidents[0]!;
    const loss = /none/i.test(worst.loss) ? "warn" : "fail";
    signals.push(
      sig(
        "incident_history",
        "Incident history",
        loss,
        loss === "fail" ? 95 : 60,
        "high",
        { incidents: assetIncidents },
        worst.summary,
      ),
    );
  } else {
    signals.push(
      unknown(
        "incident_history",
        "Incident history",
        "No incident record in the local registry; this is not evidence of absence.",
        { incidents: [] },
      ),
    );
  }

  // 12. Admin / script change
  const fingerprint = `${liveType?.code_hash ?? asset.codeHash ?? ""}:${
    liveType?.hash_type ?? asset.hashType ?? ""
  }:${liveArgs ?? ""}`;
  const prevAdmin = previous?.signals?.find((s) => s.id === "admin_change");
  // A baseline stores `fingerprint`; a comparison stores `current`. Carry
  // `current` forward so a pass does not reset to unknown on the next run.
  const prevFingerprint =
    prevAdmin?.evidence?.fingerprint ?? prevAdmin?.evidence?.current;
  const prevMethodology = prevAdmin?.evidence?.methodologyVersion;
  if (
    !prevFingerprint ||
    prevMethodology !== config.methodologyVersion
  ) {
    signals.push(
      unknown(
        "admin_change",
        "Admin / script change",
        "First observation under this methodology; baseline recorded for future comparisons.",
        { fingerprint, methodologyVersion: config.methodologyVersion },
      ),
    );
  } else {
    signals.push(
      sig(
        "admin_change",
        "Admin / script change",
        prevFingerprint === fingerprint ? "pass" : "fail",
        prevFingerprint === fingerprint ? 0 : 95,
        "high",
        {
          previous: prevFingerprint,
          current: fingerprint,
          methodologyVersion: config.methodologyVersion,
        },
        prevFingerprint === fingerprint
          ? "Type script, code hash and args are unchanged since the previous observation."
          : "Type script, code hash or args changed since the previous observation.",
      ),
    );
  }

  // Vault-specific signals
  if (asset.kind === "vault") {
    if (asset.symbol === "dCKB") {
      signals.push(
        sig(
          "withdrawal_availability",
          "Withdrawal availability",
          "fail",
          100,
          "high",
          { status: "unbacked", manual: asset.manual },
          "dCKB is unbacked after the 2026 drain; withdrawals cannot be honoured at par.",
        ),
      );
    } else if (asset.symbol === "MoniMkt") {
      signals.push(
        unknown(
          "withdrawal_availability",
          "Withdrawal availability",
          "Testnet deployment; no mainnet liquidity or positions to measure.",
          { status: "testnet" },
        ),
      );
    } else if (vault) {
      signals.push(
        unknown(
          "withdrawal_availability",
          "Withdrawal availability",
          `Pool holds ${vault.poolCkbHuman.toFixed(2)} CKB against ${vault.tokenSupplyHuman.toFixed(2)} ${asset.symbol}; individual DAO deposit maturity is not yet modelled.`,
          {
            poolCkb: vault.poolCkb,
            poolCkbHuman: vault.poolCkbHuman,
            tokenSupply: vault.tokenSupply,
            depositCells: vault.depositCells,
            partial: vault.partial,
          },
        ),
      );
    } else {
      signals.push(
        unknown(
          "withdrawal_availability",
          "Withdrawal availability",
          "Vault withdrawal state is not yet modelled for this asset.",
        ),
      );
    }

    if (vault) {
      const prevRate = previous?.snapshot?.exchangeRate ?? null;
      if (prevRate == null || vault.exchangeRate == null) {
        signals.push(
          unknown(
            "exchange_rate_velocity",
            "Exchange-rate velocity",
            "First observation of the vault exchange rate; baseline recorded for future comparisons.",
            {
              exchangeRate: vault.exchangeRate,
              poolCkbHuman: vault.poolCkbHuman,
              tokenSupplyHuman: vault.tokenSupplyHuman,
              source: vault.source,
            },
          ),
        );
      } else {
        const delta = (vault.exchangeRate - prevRate) / prevRate;
        const status: SignalStatus =
          delta <= -0.01 ? "fail" : delta >= 0.02 ? "warn" : "pass";
        signals.push(
          sig(
            "exchange_rate_velocity",
            "Exchange-rate velocity",
            status,
            status === "fail" ? 90 : status === "warn" ? 70 : 0,
            "high",
            {
              previousExchangeRate: prevRate,
              currentExchangeRate: vault.exchangeRate,
              changePct: delta * 100,
              hours: previous?.snapshot
                ? (ctx.now - previous.snapshot.ts) / 3_600_000
                : null,
              poolCkbHuman: vault.poolCkbHuman,
              tokenSupplyHuman: vault.tokenSupplyHuman,
            },
            status === "pass"
              ? `Exchange rate ${vault.exchangeRate.toFixed(6)} CKB/${asset.symbol} is stable.`
              : `Exchange rate changed ${(delta * 100).toFixed(2)}% since the previous observation.`,
          ),
        );
      }

      const backing = vault.backingRatio;
      const backingStatus: SignalStatus =
        backing == null ? "unknown" : backing < 1 ? "fail" : backing < 1.05 ? "warn" : "pass";
      signals.push(
        sig(
          "collateral_health",
          "Collateral health",
          backingStatus,
          backingStatus === "fail" ? 95 : backingStatus === "warn" ? 60 : backingStatus === "pass" ? 0 : null,
          "high",
          {
            exchangeRate: vault.exchangeRate,
            backingRatio: backing,
            poolCkbHuman: vault.poolCkbHuman,
            tokenSupplyHuman: vault.tokenSupplyHuman,
            depositCells: vault.depositCells,
            source: vault.source,
          },
          backing == null
            ? "Vault backing could not be computed."
            : backing < 1
              ? `Backing ratio ${backing.toFixed(4)} CKB/${asset.symbol} is below 1:1.`
              : `Backing ratio ${backing.toFixed(4)} CKB/${asset.symbol} covers supply.`,
        ),
      );

      signals.push(
        unknown(
          "oracle_health",
          "Oracle health",
          `${asset.symbol} has no price oracle; its exchange rate is protocol-derived from DAO deposits.`,
          { source: vault.source },
        ),
      );
    } else {
      signals.push(
        unknown(
          "exchange_rate_velocity",
          "Exchange-rate velocity",
          "Needs a vault share-price series; not yet integrated.",
        ),
      );
      signals.push(
        unknown(
          "oracle_health",
          "Oracle health",
          "Needs the protocol oracle cell/publisher set; not yet integrated.",
        ),
      );
      signals.push(
        unknown(
          "collateral_health",
          "Collateral health",
          "Needs vault/CDP state (collateral ratio, debt, liquidation buffer); not yet integrated.",
        ),
      );
    }
  }

  // Token-only signals
  if (asset.kind === "token") {
    signals.push(
      unknown(
        "deployer_history",
        "Deployer history",
        "Deployer transaction graph is not yet integrated.",
      ),
    );
    signals.push(
      unknown(
        "market_integrity",
        "Market integrity",
        "Volume/wash-trading analysis needs DEX trade history; not yet integrated.",
      ),
    );
    signals.push(
      unknown(
        "script_audit",
        "Script audit",
        audit
          ? audit.audited
            ? "No audit record for this token."
            : "No third-party audit found in the local registry."
          : "No audit record for this token.",
      ),
    );
  }

  // Script audit for vaults/stablecoins
  if (asset.kind !== "token") {
    if (audit) {
      signals.push(
        sig(
          "script_audit",
          "Script audit",
          audit.audited ? "pass" : "warn",
          audit.audited ? 5 : 60,
          audit.audited ? "high" : "medium",
          audit,
          audit.audited
            ? `Audited by ${audit.firms.join(", ")} (${audit.lastAudit}).`
            : "No third-party audit found in the local registry.",
        ),
      );
    } else {
      signals.push(
        unknown(
          "script_audit",
          "Script audit",
          "No audit record for this asset.",
        ),
      );
    }
  }

  // Manual assets: add a clear status signal.
  if (asset.source === "manual" && asset.manual) {
    signals.push(
      sig(
        "manual_status",
        "Manual status",
        asset.manual.status === "unbacked" ? "fail" : "warn",
        asset.manual.status === "unbacked" ? 100 : 50,
        "high",
        asset.manual,
        asset.manual.reason,
      ),
    );
  }

  return signals;
}
