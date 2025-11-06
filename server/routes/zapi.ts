import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_KEY ?? "");

export const handleZapiWebhook: RequestHandler = async (req, res) => {
  try {
    const payload = req.body;
    console.log("Z-API webhook received:", JSON.stringify(payload));

    // Map payload to fiqon table expected fields. Adjust depending on payload structure.
    const phone = payload?.to ?? payload?.phone ?? payload?.numero ?? payload?.recipient ?? null;
    const message = payload?.message ?? payload?.text ?? payload?.body ?? payload?.mensagem ?? null;
    const name = payload?.fromName ?? payload?.senderName ?? undefined;
    const created_at = new Date().toISOString();

    if (!phone || !message) {
      // Not enough data to create a message row
      return res.status(400).json({ ok: false, reason: "missing phone or message" });
    }

    const insert = await supabase.from("fiqon").insert([
      {
        // minimal fields that are used by the client
        phone,
        message,
        name: name ?? "WhatsApp",
        from_me: false,
        source: "Z-API-webhook",
        created_at,
      },
    ]);

    if (insert.error) {
      try {
        console.error("Error inserting webhook message into supabase:", JSON.stringify(insert.error, Object.getOwnPropertyNames(insert.error)));
        console.error("Full insert response:", JSON.stringify(insert, null, 2));
      } catch (e) {
        console.error("Error inserting webhook message into supabase (non-serializable):", insert.error);
      }
      return res.status(500).json({ ok: false, error: insert.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Error handling Z-API webhook:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};
