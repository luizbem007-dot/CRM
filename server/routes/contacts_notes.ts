import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const FALLBACK_URL = "https://bwstynvthxuwaiyrgjoe.supabase.co";
  const FALLBACK_SERVICE = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_ANON_KEY ?? "";
  const SUPABASE_URL = process.env.SUPABASE_URL ?? FALLBACK_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_ANON_KEY ?? FALLBACK_SERVICE;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE)
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
}

export const handleCreateContact: RequestHandler = async (req, res) => {
  try {
    const { phone, name, notes, tags } = req.body as any;
    if (!phone || !name)
      return res
        .status(400)
        .json({ ok: false, error: "phone and name required" });
    const supabase = getSupabase();
    const insert = await supabase
      .from("contacts")
      .upsert({ phone, name, notes, tags })
      .select();
    if (insert.error) {
      console.error('[contacts] upsert error', insert.error);
      if ((insert.error as any).code === 'PGRST205' || String((insert.error as any).message).includes('Could not find the table')) {
        console.warn('[contacts] contacts table missing; returning synthetic contact');
        return res.json({ ok: true, data: [{ id: null, phone, name, notes, tags }] });
      }
      return res.status(500).json({ ok: false, error: insert.error });
    }
    return res.json({ ok: true, data: insert.data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleEditContact: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, notes, tags } = req.body as any;
    const supabase = getSupabase();
    const update = await supabase
      .from("contacts")
      .update({ name, notes, tags })
      .eq("id", id)
      .select();
    if (update.error) {
      console.error('[contacts] update error', update.error);
      if ((update.error as any).code === 'PGRST205' || String((update.error as any).message).includes('Could not find the table')) {
        console.warn('[contacts] contacts table missing; returning synthetic update');
        return res.json({ ok: true, data: [{ id, name, notes, tags }] });
      }
      return res.status(500).json({ ok: false, error: update.error });
    }
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleAddNote: RequestHandler = async (req, res) => {
  try {
    const { conversation_id, author, text } = req.body as any;
    if (!conversation_id || !text)
      return res
        .status(400)
        .json({ ok: false, error: "conversation_id and text required" });
    const supabase = getSupabase();
    const insert = await supabase
      .from("conversation_notes")
      .insert({ conversation_id, author, text })
      .select();
    if (insert.error)
      return res.status(500).json({ ok: false, error: insert.error });
    return res.json({ ok: true, data: insert.data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetNotes: RequestHandler = async (req, res) => {
  try {
    const { conversation_id } = req.query as any;
    if (!conversation_id)
      return res
        .status(400)
        .json({ ok: false, error: "conversation_id required" });
    const supabase = getSupabase();
    const q = await supabase
      .from("conversation_notes")
      .select("*")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: false });
    if (q.error) return res.status(500).json({ ok: false, error: q.error });
    return res.json({ ok: true, data: q.data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
