import nodemailer from "nodemailer";
import { config } from "./config.js";
import { recordDelivery, type AlertInput } from "./db.js";

export interface ChannelResult {
  channel: "telegram" | "email";
  status: "delivered" | "skipped" | "failed";
  httpStatus?: number;
  attempts?: number;
  error?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function alertText(alert: AlertInput): string {
  return [
    `secnev alert: ${alert.assetSymbol} ${alert.severity}`,
    `detector: ${alert.detector}`,
    alert.oldTier || alert.newTier
      ? `tier: ${alert.oldTier ?? "?"} -> ${alert.newTier ?? "?"}`
      : null,
    `why: ${alert.whyNow}`,
    `evidence: ${JSON.stringify(alert.evidence)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendTelegram(alert: AlertInput): Promise<ChannelResult> {
  if (!config.telegramBotToken || !config.telegramChatId) {
    recordDelivery(alert.id, "telegram", "not_configured", null, 0);
    return { channel: "telegram", status: "skipped" };
  }

  const url = `${config.telegramApiBase}/bot${config.telegramBotToken}/sendMessage`;
  const body = JSON.stringify({
    chat_id: config.telegramChatId,
    text: alertText(alert).slice(0, 4000),
    disable_web_page_preview: true,
  });
  const maxAttempts = 3;
  let attemptsMade = 0;
  let lastError = "telegram delivery failed";
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attemptsMade = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": config.userAgent,
        },
        body,
        signal: controller.signal,
      });
      if (res.ok) {
        recordDelivery(alert.id, "telegram", "delivered", null, attempt);
        return {
          channel: "telegram",
          status: "delivered",
          httpStatus: res.status,
          attempts: attempt,
        };
      }
      lastStatus = res.status;
      lastError = `HTTP ${res.status}`;
      if (res.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
    if (attempt < maxAttempts) await sleep(250 * attempt);
  }

  recordDelivery(alert.id, "telegram", "failed", lastError, attemptsMade);
  return {
    channel: "telegram",
    status: "failed",
    httpStatus: lastStatus,
    attempts: attemptsMade,
    error: lastError,
  };
}

export async function sendEmail(alert: AlertInput): Promise<ChannelResult> {
  if (!config.emailSmtpHost || !config.emailFrom || !config.emailTo) {
    recordDelivery(alert.id, "email", "not_configured", null, 0);
    return { channel: "email", status: "skipped" };
  }

  try {
    const transport = nodemailer.createTransport({
      host: config.emailSmtpHost,
      port: config.emailSmtpPort,
      secure: config.emailSmtpSecure,
      auth: config.emailUser
        ? { user: config.emailUser, pass: config.emailPass }
        : undefined,
    });
    await transport.sendMail({
      from: config.emailFrom,
      to: config.emailTo,
      subject: `[secnev] ${alert.assetSymbol} ${alert.severity} (${alert.detector})`,
      text: alertText(alert),
    });
    recordDelivery(alert.id, "email", "delivered", null, 1);
    return { channel: "email", status: "delivered", attempts: 1 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    recordDelivery(alert.id, "email", "failed", message, 1);
    return { channel: "email", status: "failed", attempts: 1, error: message };
  }
}
