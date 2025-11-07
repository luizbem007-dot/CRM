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

    const supabase = getSupabase();
    const insert = await supabase.from("fiqon").insert([
      {
        // minimal fields that are used by the client
        phone,
        message,
        name: name ?? "WhatsApp",
        source: "Z-API-webhook",
        created_at,
      },
    ]);

    if (insert.error) {
      try {
        console.error(
          "Error inserting webhook message into supabase:",
          JSON.stringify(
            insert.error,
            Object.getOwnPropertyNames(insert.error),
          ),
        );
        console.error("Full insert response:", JSON.stringify(insert, null, 2));
      } catch (e) {
        console.error(
          "Error inserting webhook message into supabase (non-serializable):",
          insert.error,
        );
      }
      // If table missing in dev, accept the payload and return OK so webhook doesn't error
      if ((insert.error as any).code === 'PGRST205' || String((insert.error as any).message).includes('Could not find the table')) {
        console.warn('[zapi] fiqon table missing; accepting webhook payload in dev');
        return res.status(200).json({ ok: true });
      }
      return res.status(500).json({ ok: false, error: insert.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Error handling Z-API webhook:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
