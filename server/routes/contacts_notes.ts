import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export const handleCreateContact: RequestHandler = async (req, res) => {
  try {
    const { phone, name, notes, tags } = req.body as any;
    if (!phone || !name) return res.status(400).json({ ok: false, error: 'phone and name required' });
    const insert = await supabase.from('contacts').upsert({ phone, name, notes, tags }).select();
    if (insert.error) return res.status(500).json({ ok: false, error: insert.error });
    return res.json({ ok: true, data: insert.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleEditContact: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, notes, tags } = req.body as any;
    const update = await supabase.from('contacts').update({ name, notes, tags }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleAddNote: RequestHandler = async (req, res) => {
  try {
    const { conversation_id, author, text } = req.body as any;
    if (!conversation_id || !text) return res.status(400).json({ ok: false, error: 'conversation_id and text required' });
    const insert = await supabase.from('conversation_notes').insert({ conversation_id, author, text }).select();
    if (insert.error) return res.status(500).json({ ok: false, error: insert.error });
    return res.json({ ok: true, data: insert.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetNotes: RequestHandler = async (req, res) => {
  try {
    const { conversation_id } = req.query as any;
    if (!conversation_id) return res.status(400).json({ ok: false, error: 'conversation_id required' });
    const q = await supabase.from('conversation_notes').select('*').eq('conversation_id', conversation_id).order('created_at', { ascending: false });
    if (q.error) return res.status(500).json({ ok: false, error: q.error });
    return res.json({ ok: true, data: q.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};
