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
    // Use mock storage
    const inserted = (await import("../mockData")).default.upsertContactMock({ phone, name, notes, tags });
    return res.json({ ok: true, data: [inserted] });
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
    const updated = (await import("../mockData")).default.updateContactByIdMock(id, { name, notes, tags });
    return res.json({ ok: true, data: updated ? [updated] : [] });
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
    const inserted = (await import("../mockData")).default.addNoteMock({ conversation_id, author, text });
    return res.json({ ok: true, data: [inserted] });
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
    const data = (await import("../mockData")).default.getNotesMock(conversation_id ?? null);
    return res.json({ ok: true, data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
