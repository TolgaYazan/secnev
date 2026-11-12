import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHmac } from "node:crypto";
import { config } from "../src/config.js";
import { getDb, insertAlert } from "../src/db.js";
import { deliverAlert } from "../src/webhook.js";

// Keep the test out of the development database.
const testDb = path.join(os.tmpdir(), `secnev-webhook-${process.pid}.db`);
for (const file of [testDb, `${testDb}-wal`, `${testDb}-shm`]) {
  fs.rmSync(file, { force: true });
}
config.dbPath = testDb;

test("webhook delivery signs the payload and records delivery", async () => {
  let received: { body: string; signature: string; event: string } | null = null;
  const server = http.createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      received = {
        body,
        signature: String(req.headers["x-secnev-signature"] ?? ""),
        event: String(req.headers["x-secnev-event"] ?? ""),
      };
      res.writeHead(204);
      res.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port =
    address && typeof address === "object" ? address.port : 0;

  const oldUrl = config.alertWebhookUrl;
  const oldSecret = config.alertWebhookSecret;
  config.alertWebhookUrl = `http://127.0.0.1:${port}/hook`;
  config.alertWebhookSecret = "test-secret";

  try {
    const alert = {
      id: `test:${Date.now()}`,
      assetId: "ckb:stablecoin:test",
      assetSymbol: "TEST",
      detector: "webhook_test",
      severity: "warning",
      oldTier: "watch",
      newTier: "warning",
      whyNow: "unit test",
      evidence: { test: true },
      createdAt: Date.now(),
    };
    insertAlert(alert);
    const result = await deliverAlert(alert);
    assert.equal(result.status, "delivered");
    assert.ok(received);
    const got = received as { body: string; signature: string; event: string };
    assert.equal(got.event, "alert");
    const expected =
      "sha256=" +
      createHmac("sha256", "test-secret").update(got.body).digest("hex");
    assert.equal(got.signature, expected);

    const row = getDb()
      .prepare(`SELECT delivery_status FROM alerts WHERE id = ?`)
      .get(alert.id) as { delivery_status: string } | undefined;
    assert.equal(row?.delivery_status, "delivered");
  } finally {
    config.alertWebhookUrl = oldUrl;
    config.alertWebhookSecret = oldSecret;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("telegram delivery posts the alert and records the channel", async () => {
  let received: { chatId?: string; text?: string } | null = null;
  const server = http.createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsed = JSON.parse(body) as { chat_id?: string; text?: string };
      received = { chatId: parsed.chat_id, text: parsed.text };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = address && typeof address === "object" ? address.port : 0;

  const oldUrl = config.alertWebhookUrl;
  const oldToken = config.telegramBotToken;
  const oldChat = config.telegramChatId;
  const oldBase = config.telegramApiBase;
  config.alertWebhookUrl = "";
  config.telegramBotToken = "test-token";
  config.telegramChatId = "12345";
  config.telegramApiBase = `http://127.0.0.1:${port}`;

  try {
    const alert = {
      id: `test:tg:${Date.now()}`,
      assetId: "ckb:stablecoin:test",
      assetSymbol: "TEST",
      detector: "telegram_test",
      severity: "warning",
      oldTier: "watch",
      newTier: "warning",
      whyNow: "unit test",
      evidence: { test: true },
      createdAt: Date.now(),
    };
    insertAlert(alert);
    const result = await deliverAlert(alert);
    assert.equal(result.status, "delivered");
    const got = received as { chatId?: string; text?: string } | null;
    assert.equal(got?.chatId, "12345");
    assert.match(String(got?.text), /secnev alert: TEST warning/);
    const row = getDb()
      .prepare(
        `SELECT status FROM alert_deliveries WHERE alert_id = ? AND channel = 'telegram'`,
      )
      .get(alert.id) as { status: string } | undefined;
    assert.equal(row?.status, "delivered");
  } finally {
    config.alertWebhookUrl = oldUrl;
    config.telegramBotToken = oldToken;
    config.telegramChatId = oldChat;
    config.telegramApiBase = oldBase;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
