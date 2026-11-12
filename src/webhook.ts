import { createHmac } from "node:crypto";
import { config } from "./config.js";
import { markAlertDelivery, type AlertInput } from "./db.js";
import { sendEmail, sendTelegram, type ChannelResult } from "./notify.js";

export interface DeliveryResult {
  status: "delivered" | "skipped" | "failed";
  channel?: string;
  httpStatus?: number;
  attempts?: number;
  error?: string;
  channels?: ChannelResult[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deliver one alert to ALERT_WEBHOOK_URL.
 *
 * The body is signed with HMAC-SHA256 when ALERT_WEBHOOK_SECRET is set:
 *   x-secnev-signature: sha256=<hex digest>
 *
 * Delivery never throws: an ingest must not fail because a webhook is down.
 */
async function deliverWebhook(alert: AlertInput): Promise<DeliveryResult> {
  if (!config.alertWebhookUrl) {
    markAlertDelivery(alert.id, "not_configured", null);
    return { channel: "webhook", status: "skipped" };
  }

  const body = JSON.stringify({
    event: "alert",
    sentAt: new Date().toISOString(),
    alert,
  });
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": config.userAgent,
    "x-secnev-event": "alert",
  };
  if (config.alertWebhookSecret) {
    headers["x-secnev-signature"] =
      "sha256=" +
      createHmac("sha256", config.alertWebhookSecret).update(body).digest("hex");
  }

  const maxAttempts = 3;
  let lastStatus: number | undefined;
  let lastError = "delivery failed";
  let attemptsMade = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attemptsMade = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      const res = await fetch(config.alertWebhookUrl, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
      if (res.ok) {
        markAlertDelivery(alert.id, "delivered", null, attempt);
        return {
          channel: "webhook",
          status: "delivered",
          httpStatus: res.status,
          attempts: attempt,
        };
      }
      lastStatus = res.status;
      const text = (await res.text().catch(() => "")).slice(0, 300);
      lastError = `HTTP ${res.status}${text ? `: ${text}` : ""}`;
      // 4xx is a contract error (bad URL/secret); retrying will not help.
      if (res.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
    if (attempt < maxAttempts) await sleep(250 * attempt);
  }

  markAlertDelivery(alert.id, "failed", lastError, attemptsMade);
  return {
    channel: "webhook",
    status: "failed",
    httpStatus: lastStatus,
    attempts: attemptsMade,
    error: lastError,
  };
}

/**
 * Deliver one alert to every configured channel. A missing channel is skipped;
 * a failing channel does not prevent the others from running.
 */
export async function deliverAlert(alert: AlertInput): Promise<DeliveryResult> {
  const [webhook, telegram, email] = await Promise.all([
    deliverWebhook(alert),
    sendTelegram(alert),
    sendEmail(alert),
  ]);
  const channels = [webhook, telegram, email] as ChannelResult[];
  const configured = channels.filter((c) => c.status !== "skipped");
  const status =
    configured.length === 0
      ? "skipped"
      : configured.every((c) => c.status === "delivered")
        ? "delivered"
        : "failed";
  return { status, channels };
}
