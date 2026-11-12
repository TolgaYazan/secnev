import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export interface LockLabel {
  name: string | null;
  kind: "wallet" | "protocol" | "dex" | "whale" | "market_maker" | "unknown";
  excludeFromOrganic: boolean;
}

const labels = require("../config/labels.json") as Record<string, LockLabel>;

export function lockMeta(codeHash: string | undefined | null): LockLabel {
  if (!codeHash) return { name: null, kind: "unknown", excludeFromOrganic: false };
  return (
    labels[codeHash.toLowerCase()] ?? {
      name: null,
      kind: "unknown",
      excludeFromOrganic: false,
    }
  );
}
