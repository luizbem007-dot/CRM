import { RequestHandler } from "express";

export const handleTestZapi: RequestHandler = async (req, res) => {
  try {
    const ZAPI_URL = (process.env.VITE_ZAPI_URL ?? "").toString();
    const CLIENT_TOKEN = (process.env.VITE_ZAPI_CLIENT_TOKEN ?? "").toString();
    if (!ZAPI_URL) return res.status(400).json({ ok: false, error: "VITE_ZAPI_URL not set" });

    const phone = (req.query.phone as string) ?? "557398385179";
    const message = (req.query.message as string) ?? "Mensagem de teste enviada do CRM 🚀";

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CLIENT_TOKEN) headers["Client-Token"] = CLIENT_TOKEN;

    // Use global fetch available in Node 18+
    const zres = await (globalThis as any).fetch(ZAPI_URL, { method: "POST", headers, body: JSON.stringify({ phone, message }) });
    const bodyText = await zres.text().catch((e: any) => `<error reading body: ${e?.message ?? e}>`);

    return res.status(200).json({ ok: true, status: zres.status, body: bodyText });
  } catch (err: any) {
    console.error("Error calling Z-API test:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};
