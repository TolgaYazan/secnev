import { config } from "./config.js";

const headers = {
  accept: "application/vnd.api+json",
  "content-type": "application/vnd.api+json",
  "user-agent": config.userAgent,
};

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.ingestTimeoutMs);
  try {
    const res = await fetch(`${config.explorerUrl}${path}`, {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Explorer ${path}: HTTP ${res.status} ${text.slice(0, 160)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface ExplorerUdt {
  id: string;
  type: "udt";
  attributes: {
    symbol: string;
    full_name: string;
    type_hash: string;
    type_script: { args: string; code_hash: string; hash_type: string } | null;
    issuer_address: string | null;
    decimal: string;
    total_amount: string;
    holders_count: string;
    addresses_count: string;
    created_at: string;
    udt_type: string;
    published: boolean;
    xudt_tags: string[] | null;
    description?: string | null;
  };
}

export async function getXudtBySymbol(
  symbol: string,
): Promise<ExplorerUdt | null> {
  const json = await get<{ data: ExplorerUdt[] }>(
    `/xudts?symbol=${encodeURIComponent(symbol)}&page_size=20`,
  );
  const rows = json.data ?? [];
  return (
    rows.find(
      (r) =>
        r.attributes.symbol.toLowerCase() === symbol.toLowerCase() &&
        r.attributes.published,
    ) ??
    rows[0] ??
    null
  );
}

export async function getXudtDetail(
  typeHash: string,
): Promise<ExplorerUdt | null> {
  try {
    const json = await get<{ data: ExplorerUdt }>(`/xudts/${typeHash}`);
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getHolderAllocation(typeHash: string): Promise<{
  btc_holder_count: number;
  lock_hashes: Array<{
    name: string | null;
    code_hash: string;
    hash_type: string;
    holder_count: number;
  }>;
} | null> {
  try {
    return await get(`/udts/${typeHash}/holder_allocation?page_size=100`);
  } catch {
    return null;
  }
}

export async function getAddress(address: string) {
  try {
    const json = await get<{ data: unknown[] }>(`/addresses/${address}`);
    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getStatistics() {
  try {
    return await get<{ data: { attributes: Record<string, unknown> } }>(
      "/statistics",
    );
  } catch {
    return null;
  }
}
