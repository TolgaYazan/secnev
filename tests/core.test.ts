import test from "node:test";
import assert from "node:assert/strict";
import { parseU128LE, summarizeCells, type RpcCell } from "../src/ckb/rpc.js";
import { parseXudtArgs } from "../src/ckb/address.js";
import { gradeFor, scoreAsset, tierFor } from "../src/scoring.js";
import { computePoolMetrics } from "../src/pools.js";
import { runDetectors } from "../src/detectors.js";
import { lockMeta } from "../src/labels.js";
import { config } from "../src/config.js";
import type { AssetDef, CellSummary, Signal } from "../src/types.js";

test("grade bands follow the published 11-band scale", () => {
  assert.equal(gradeFor(0), "A+");
  assert.equal(gradeFor(5), "A+");
  assert.equal(gradeFor(6), "A");
  assert.equal(gradeFor(20), "A-");
  assert.equal(gradeFor(28), "B+");
  assert.equal(gradeFor(46), "B-");
  assert.equal(gradeFor(56), "C+");
  assert.equal(gradeFor(77), "C-");
  assert.equal(gradeFor(88), "D");
  assert.equal(gradeFor(89), "F");
  assert.equal(gradeFor(100), "F");
});

test("tier bands are ok/watch/warning/critical", () => {
  assert.equal(tierFor(0), "ok");
  assert.equal(tierFor(24), "ok");
  assert.equal(tierFor(25), "watch");
  assert.equal(tierFor(49), "watch");
  assert.equal(tierFor(50), "warning");
  assert.equal(tierFor(69), "warning");
  assert.equal(tierFor(70), "critical");
});

test("parseU128LE reads little-endian u128", () => {
  assert.equal(parseU128LE("0x01000000000000000000000000000000"), 1n);
  assert.equal(parseU128LE("0x00010000000000000000000000000000"), 256n);
  assert.equal(
    parseU128LE("0x39300000000000000000000000000000"),
    12345n,
  );
});

test("RUSD type args are a plain owner-lock hash with no flags", () => {
  const parsed = parseXudtArgs(
    "0x360c9d87b2824c357958c23e8878f686001e88e9527a08ea229e7d9ba7fe39a7",
  );
  assert.equal(
    parsed.ownerLockHash,
    "0x360c9d87b2824c357958c23e8878f686001e88e9527a08ea229e7d9ba7fe39a7",
  );
  assert.equal(parsed.flags, 0);
  assert.equal(parsed.hasExtensions, false);
  assert.equal(parsed.ownerMode.inputLock, true);
});

test("iCKB args set the 0x80000000 input-type owner-mode flag", () => {
  const parsed = parseXudtArgs(
    "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e800000080",
  );
  assert.equal(
    parsed.ownerLockHash,
    "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e8",
  );
  assert.equal(parsed.flags, 0x80000000);
  assert.equal(parsed.hasExtensions, false);
  assert.equal(parsed.ownerMode.inputType, true);
});

test("summarizeCells aggregates by lock and computes top-10 share", () => {
  const cells: RpcCell[] = [
    {
      out_point: { tx_hash: "0x1", index: "0" },
      output: {
        capacity: "0x1",
        lock: { code_hash: "0xa", hash_type: "type", args: "0x01" },
        type: null,
      },
      output_data: "0x64000000000000000000000000000000",
      block_number: "0x1",
      tx_index: "0",
    },
    {
      out_point: { tx_hash: "0x2", index: "0" },
      output: {
        capacity: "0x1",
        lock: { code_hash: "0xa", hash_type: "type", args: "0x01" },
        type: null,
      },
      output_data: "0x64000000000000000000000000000000",
      block_number: "0x1",
      tx_index: "0",
    },
    {
      out_point: { tx_hash: "0x3", index: "0" },
      output: {
        capacity: "0x1",
        lock: { code_hash: "0xa", hash_type: "type", args: "0x02" },
        type: null,
      },
      output_data: "0x32000000000000000000000000000000",
      block_number: "0x1",
      tx_index: "0",
    },
  ];
  const summary = summarizeCells(cells, 250n);
  assert.equal(summary.totalAmount, 250n);
  assert.equal(summary.cellCount, 3);
  assert.equal(summary.holderCount, 2);
  assert.equal(summary.holders[0]?.amount, 200n);
  assert.equal(summary.holders[0]?.share, 0.8);
});

test("UTXOSwap pool locks are excluded from organic supply", () => {
  const meta = lockMeta(
    "0x393df3359e33f85010cd65a3c4a4268f72d95ec6b049781a916c680b31ea9a88",
  );
  assert.equal(meta.kind, "dex");
  assert.equal(meta.excludeFromOrganic, true);
});

test("pool metrics compute a real price, TVL and 1% depth", () => {
  const m = computePoolMetrics(
    72_515_095_184n, // 725.15 RUSD
    57_231_934_944_233n, // 572,319.35 CKB
    8,
    8,
    0.00091745,
  );
  assert.ok(m.priceUsd != null);
  assert.ok(Math.abs(m.priceUsd - 0.7238) < 0.01);
  assert.ok(m.tvlUsd != null && m.tvlUsd > 1_000 && m.tvlUsd < 1_100);
  assert.ok(m.depth1pctUsd != null && m.depth1pctUsd < 5);
});

test("an empty incident registry is unknown, not safe", () => {
  const asset: AssetDef = {
    id: "test",
    symbol: "TEST",
    name: "Test",
    kind: "token",
    source: "explorer",
    decimals: 8,
    tags: [],
    args: `0x${"00".repeat(32)}`,
  };
  const cells: CellSummary = {
    totalAmount: 0n,
    cellCount: 0,
    holderCount: 0,
    holders: [],
    lockDistribution: [],
    partial: false,
    pages: 0,
  };
  const signals = runDetectors({
    asset,
    explorer: null,
    cells,
    supply: 0n,
    priceUsd: null,
    priceSource: null,
    previous: undefined,
    now: Date.now(),
  });
  assert.equal(
    signals.find((s) => s.id === "incident_history")?.status,
    "unknown",
  );
});

test("iCKB's xUDT owner-mode flag is a design pass, not an extension warning", () => {
  const asset: AssetDef = {
    id: "ickb",
    symbol: "iCKB",
    name: "iCKB",
    kind: "vault",
    source: "explorer",
    decimals: 8,
    tags: [],
    args: "0xb73b6ab39d79390c6de90a09c96b290c331baf1798ed6f97aed02590929734e800000080",
  };
  const cells: CellSummary = {
    totalAmount: 0n,
    cellCount: 0,
    holderCount: 0,
    holders: [],
    lockDistribution: [],
    partial: false,
    pages: 0,
  };
  const signals = runDetectors({
    asset,
    explorer: null,
    cells,
    supply: 0n,
    priceUsd: null,
    priceSource: null,
    previous: undefined,
    now: Date.now(),
  });
  const xudt = signals.find((s) => s.id === "xudt_extensions");
  assert.equal(xudt?.status, "pass");
  assert.match(String(xudt?.reason), /design/i);
});

test("admin comparison carries the current fingerprint forward", () => {
  const asset: AssetDef = {
    id: "admin",
    symbol: "ADMIN",
    name: "Admin",
    kind: "token",
    source: "explorer",
    codeHash: "0xaa",
    hashType: "type",
    args: "0xbb",
    decimals: 8,
    tags: [],
  };
  const fingerprint = "0xaa:type:0xbb";
  const cells: CellSummary = {
    totalAmount: 0n,
    cellCount: 0,
    holderCount: 0,
    holders: [],
    lockDistribution: [],
    partial: false,
    pages: 0,
  };
  const signals = runDetectors({
    asset,
    explorer: null,
    cells,
    supply: 0n,
    priceUsd: null,
    priceSource: null,
    previous: {
      signals: [
        {
          id: "admin_change",
          name: "Admin / script change",
          status: "pass",
          score: 0,
          confidence: "high",
          evidence: {
            previous: fingerprint,
            current: fingerprint,
            methodologyVersion: config.methodologyVersion,
          },
          reason: "unchanged",
        },
      ],
    },
    now: Date.now(),
  });
  assert.equal(
    signals.find((s) => s.id === "admin_change")?.status,
    "pass",
  );
});

test("unknown signals are excluded from the weighted score and lower coverage", () => {
  const asset: AssetDef = {
    id: "test",
    symbol: "TEST",
    name: "Test",
    kind: "token",
    source: "explorer",
    decimals: 8,
    tags: [],
  };
  const signals: Signal[] = [
    {
      id: "holder_concentration",
      name: "Holder concentration",
      status: "fail",
      score: 90,
      confidence: "high",
      evidence: {},
      reason: "concentrated",
    },
    {
      id: "mint_authority",
      name: "Mint authority",
      status: "unknown",
      score: null,
      confidence: "low",
      evidence: {},
      reason: "unknown",
    },
  ];
  const result = scoreAsset(asset, signals);
  assert.equal(result.coverage.live, 1);
  assert.equal(result.coverage.total, 2);
  assert.equal(result.score, 90);
  assert.equal(result.confidence, "medium");
});

test("manual unbacked assets are floored to a failing score", () => {
  const asset: AssetDef = {
    id: "dckb",
    symbol: "dCKB",
    name: "dCKB",
    kind: "vault",
    source: "manual",
    decimals: 8,
    tags: [],
    manual: {
      scoreFloor: 95,
      status: "unbacked",
      reason: "drained",
      links: [],
    },
  };
  const result = scoreAsset(asset, [
    {
      id: "incident_history",
      name: "Incident history",
      status: "fail",
      score: 100,
      confidence: "high",
      evidence: {},
      reason: "drained",
    },
  ]);
  assert.ok(result.score >= 95);
  assert.equal(result.grade, "F");
  assert.equal(result.tier, "critical");
});
