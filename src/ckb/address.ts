import {
  Address,
  ClientPublicMainnet,
  Script,
  hashCkb,
} from "@ckb-ccc/core";

const client = new ClientPublicMainnet();

export interface ParsedXudtArgs {
  ownerLockHash: string | null;
  flags: number;
  hasExtensions: boolean;
  ownerMode: {
    inputLock: boolean;
    outputType: boolean;
    inputType: boolean;
  };
  raw: string;
}

/**
 * xUDT args layout (CKB docs / xUDT script):
 *   <32-byte owner lock hash> <4-byte flags (LE)> <extension ScriptVec>
 * A plain 32-byte args means no flags and no extensions.
 * Flags:
 *   0x1FFFFFFF  extension data present
 *   0x20000000  owner mode via input lock
 *   0x40000000  owner mode via output type
 *   0x80000000  owner mode via input type
 */
export function parseXudtArgs(args: string | undefined): ParsedXudtArgs {
  const raw = (args ?? "").replace(/^0x/i, "");
  const owner = raw.length >= 64 ? `0x${raw.slice(0, 64)}` : null;
  let flags = 0;
  if (raw.length >= 72) {
    const bytes = raw.slice(64, 72);
    const b = [
      parseInt(bytes.slice(0, 2), 16),
      parseInt(bytes.slice(2, 4), 16),
      parseInt(bytes.slice(4, 6), 16),
      parseInt(bytes.slice(6, 8), 16),
    ];
    flags = (b[0]! | (b[1]! << 8) | (b[2]! << 16) | (b[3]! << 24)) >>> 0;
  }
  return {
    ownerLockHash: owner,
    flags,
    hasExtensions: (flags & 0x1fffffff) !== 0,
    ownerMode: {
      inputLock: (flags & 0x20000000) === 0, // default when flag absent
      outputType: (flags & 0x40000000) !== 0,
      inputType: (flags & 0x80000000) !== 0,
    },
    raw,
  };
}

export async function addressToScript(address: string) {
  const a = await Address.fromString(address, client);
  return a.script;
}

export function scriptHash(script: {
  codeHash: string;
  hashType: string;
  args: string;
}): string {
  const encoded = Script.encode({
    codeHash: script.codeHash,
    hashType: script.hashType as never,
    args: script.args,
  });
  return hashCkb(encoded);
}

export function lockKey(lock: {
  codeHash: string;
  hashType: string;
  args: string;
}): string {
  return `${lock.codeHash}:${lock.hashType}:${lock.args}`;
}

export function shortHash(hash: string, head = 10, tail = 6): string {
  if (hash.length <= head + tail + 2) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
