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

export const handleCreateMessage: RequestHandler = async (req, res) => {
  try {
    const {
      client_message_id,
      user_id,
      phone,
      message,
      name,
      source = "CRM",
      fromMe = true,
    } = req.body as any;

    if (!message || !phone) {
      return res
        .status(400)
        .json({ ok: false, error: "missing phone or message" });
    }

    const payload = {
      client_message_id,
      user_id,
      phone,
      message,
      name: name ?? "Agente",
      source,
      created_at: new Date().toISOString(),
    } as any;

    // Use mock storage
    const inserted = (await import("../mockData")).default.insertMessageMock(payload);
    return res.status(200).json({ ok: true, data: [inserted] });
  } catch (err: any) {
    console.error("Server: exception creating message:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
