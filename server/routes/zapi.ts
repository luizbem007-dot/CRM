import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const FALLBACK_URL = "https://bwstynvthxuwaiyrgjoe.supabase.co";
  const FALLBACK_KEY = process.env.SUPABASE_ANON_KEY ?? "";
  const SUPABASE_URL = process.env.SUPABASE_URL ?? FALLBACK_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? FALLBACK_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY)
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY not configured");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export const handleZapiWebhook: RequestHandler = async (req, res) => {
  try {
    const payload = req.body;
    console.log("Z-API webhook received:", JSON.stringify(payload));

    // Map payload to fiqon table expected fields. Adjust depending on payload structure.
    const phone =
      payload?.to ??
      payload?.phone ??
      payload?.numero ??
      payload?.recipient ??
      null;
    const message =
      payload?.message ??
      payload?.text ??
      payload?.body ??
      payload?.mensagem ??
      null;
    const name = payload?.fromName ?? payload?.senderName ?? undefined;
    const created_at = new Date().toISOString();

    if (!phone || !message) {
      // Not enough data to create a message row
      return res
        .status(400)
        .json({ ok: false, reason: "missing phone or message" });
    }

    // store into mock messages
    const inserted = (await import("../mockData")).default.insertMessageMock({ phone, message, name: name ?? "WhatsApp", source: "Z-API-webhook", created_at });
    console.log('[zapi] stored mock message', inserted);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Error handling Z-API webhook:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
