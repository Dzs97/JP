// Vercel serverless function — read/write a single user's progress JSON
// keyed by their sync ID. Anyone with the ID can read/write that record,
// so treat IDs as bearer secrets (we generate 22-char random ones client-side).
//
// GET  /api/sync?id=<syncId>
//   → 200 { value: "<json-string>" | null, updatedAt: number }
//
// POST /api/sync
//   body: { id, value: "<json-string>", updatedAt: number }
//   → 200 { ok: true, updatedAt: number }
//
// Storage layout:
//   key = `jp:progress:<syncId>`
//   value = { value: string, updatedAt: number }
//
// Hard cap to keep KV usage sane:
const MAX_VALUE_BYTES = 256 * 1024;     // 256 KB — way more than any realistic progress.json
const ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS — same-origin in production, but useful for local dev too.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const { id } = req.query || {};
      if (!id || !ID_REGEX.test(String(id))) {
        return res.status(400).json({ error: "invalid id" });
      }
      const record = await kv.get(`jp:progress:${id}`);
      return res.status(200).json(record || { value: null, updatedAt: 0 });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const { id, value, updatedAt } = body;
      if (!id || !ID_REGEX.test(String(id))) {
        return res.status(400).json({ error: "invalid id" });
      }
      if (typeof value !== "string") {
        return res.status(400).json({ error: "value must be a JSON string" });
      }
      if (value.length > MAX_VALUE_BYTES) {
        return res.status(413).json({ error: "value too large" });
      }
      const ts = Number(updatedAt) > 0 ? Number(updatedAt) : Date.now();
      await kv.set(`jp:progress:${id}`, { value, updatedAt: ts });
      return res.status(200).json({ ok: true, updatedAt: ts });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("sync handler error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
