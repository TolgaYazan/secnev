import path from "node:path";
import "./env.js";

export const ROOT = process.cwd();

export const config = {
  port: Number(process.env.PORT ?? 8787),
  dbPath: process.env.DB_PATH ?? path.join(ROOT, "data", "secnev.db"),
  readOnly: process.env.DB_READ_ONLY === "1",
  ckbRpcUrl: process.env.CKB_RPC_URL ?? "https://mainnet.ckb.dev/",
  explorerUrl:
    process.env.CKB_EXPLORER_URL ??
    "https://mainnet-api.explorer.nervos.org/api/v1",
  adminToken: process.env.ADMIN_TOKEN ?? "",
  utxoswapApiKey: process.env.UTXOSWAP_API_KEY ?? "",
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
  alertWebhookSecret: process.env.ALERT_WEBHOOK_SECRET ?? "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  telegramApiBase: process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org",
  emailSmtpHost: process.env.ALERT_EMAIL_SMTP_HOST ?? "",
  emailSmtpPort: Number(process.env.ALERT_EMAIL_SMTP_PORT ?? 587),
  emailSmtpSecure: process.env.ALERT_EMAIL_SMTP_SECURE === "1",
  emailUser: process.env.ALERT_EMAIL_USER ?? "",
  emailPass: process.env.ALERT_EMAIL_PASS ?? "",
  emailFrom: process.env.ALERT_EMAIL_FROM ?? "",
  emailTo: process.env.ALERT_EMAIL_TO ?? "",
  coingeckoUrl: "https://api.coingecko.com/api/v3",
  userAgent: "secnev/0.1 (+https://github.com/secnev)",
  // 0 = scan until the RPC returns an empty page, bounded by the time budget.
  maxCellPages: Number(process.env.MAX_CELL_PAGES ?? 0),
  cellPageSize: 100,
  cellScanBudgetMs: Number(process.env.CELL_SCAN_BUDGET_MS ?? 180_000),
  ingestTimeoutMs: Number(process.env.INGEST_TIMEOUT_MS ?? 20_000),
  // Risk thresholds. These are public methodology, versioned in docs/METHODOLOGY.md.
  thresholds: {
    top10Warn: 0.4,
    top10Fail: 0.6,
    top10Extreme: 0.8,
    pegWarnPct: 0.5,
    pegFailPct: 2,
    pegExtremePct: 5,
    staleHours: 48,
  },
  methodologyVersion: "0.3.0",
};

export type Config = typeof config;
