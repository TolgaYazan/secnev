import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApi } from "./api.js";
import { ensureDatabase } from "./vercel.js";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await ensureDatabase();
  const url = new URL(
    req.url ?? "/",
    `https://${req.headers.host ?? "localhost"}`,
  );
  const handled = await handleApi(req, res, url);
  if (!handled) {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "not_found" }));
  }
}
