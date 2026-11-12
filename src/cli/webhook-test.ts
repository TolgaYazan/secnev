import { config } from "../config.js";
import { deliverAlert } from "../webhook.js";

if (
  !config.alertWebhookUrl &&
  (!config.telegramBotToken || !config.telegramChatId) &&
  (!config.emailSmtpHost || !config.emailFrom || !config.emailTo)
) {
  console.error(
    "No alert channel is configured. Set ALERT_WEBHOOK_URL, TELEGRAM_BOT_TOKEN+TELEGRAM_CHAT_ID, or the ALERT_EMAIL_* variables.",
  );
  process.exit(1);
}

const result = await deliverAlert({
  id: `test:${Date.now()}`,
  assetId: "ckb:stablecoin:test",
  assetSymbol: "TEST",
  detector: "webhook_test",
  severity: "warning",
  oldTier: "watch",
  newTier: "warning",
  whyNow: "Synthetic delivery check from `npm run webhook:test`.",
  evidence: { test: true, source: "secnev" },
  createdAt: Date.now(),
});

console.log(JSON.stringify(result, null, 2));
if (result.status !== "delivered") process.exit(1);
