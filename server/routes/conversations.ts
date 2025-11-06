import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export const handleToggleBot: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body as { enabled?: boolean };
    if (typeof enabled !== "boolean") return res.status(400).json({ ok: false, error: 'enabled boolean required' });

    const update = await supabase.from('conversations').update({ bot_enabled: enabled }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleAssign: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body as { user?: string };
    if (!user) return res.status(400).json({ ok: false, error: 'user is required' });

    const update = await supabase.from('conversations').update({ assigned_to: user, assigned_at: new Date().toISOString() }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleRelease: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await supabase.from('conversations').update({ assigned_to: null, assigned_at: null }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleSetStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!['open','pending','closed'].includes(status ?? '')) return res.status(400).json({ ok: false, error: 'invalid status' });
    const update = await supabase.from('conversations').update({ status }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleUpdateTags: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body as { tags?: string[] };
    const update = await supabase.from('conversations').update({ tags }).eq('id', id).select();
    if (update.error) return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetConversations: RequestHandler = async (_req, res) => {
  try {
    const q = await supabase.from('conversations').select('*').order('created_at', { ascending: false }).limit(200);
    if (q.error) return res.status(500).json({ ok: false, error: q.error });
    return res.json({ ok: true, data: q.data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};
