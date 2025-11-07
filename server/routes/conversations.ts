import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import mock from "../mockData";

function getSupabase() {
  // fallbacks to known dev values if env is not present (helps dev preview)
  const FALLBACK_URL = "https://bwstynvthxuwaiyrgjoe.supabase.co";
  const FALLBACK_SERVICE = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_ANON_KEY ?? "";
  const SUPABASE_URL = process.env.SUPABASE_URL ?? FALLBACK_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_ANON_KEY ?? FALLBACK_SERVICE;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE)
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
}

export const handleToggleBot: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body as { enabled?: boolean };
    if (typeof enabled !== "boolean")
      return res
        .status(400)
        .json({ ok: false, error: "enabled boolean required" });

    const updated = mock.updateConversationMock(id ?? null, { bot_enabled: enabled });
    return res.json({ ok: true, data: updated ? [updated] : [] });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleAssign: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body as { user?: string };
    if (!user)
      return res.status(400).json({ ok: false, error: "user is required" });

    const updated = mock.updateConversationMock(id ?? null, { assigned_to: user, assigned_at: new Date().toISOString() });
    return res.json({ ok: true, data: updated ? [updated] : [] });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleRelease: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = mock.updateConversationMock(id ?? null, { assigned_to: null, assigned_at: null });
    return res.json({ ok: true, data: updated ? [updated] : [] });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleSetStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!["open", "pending", "closed"].includes(status ?? ""))
      return res.status(400).json({ ok: false, error: "invalid status" });

    const updated = mock.updateConversationMock(id ?? null, { status });
    return res.json({ ok: true, data: updated ? [updated] : [] });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleUpdateTags: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body as { tags?: string[] };
    const updated = mock.updateConversationMock(id ?? null, { tags });
    return res.json({ ok: true, data: updated ? [updated] : [] });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetConversations: RequestHandler = async (_req, res) => {
  try {
    const data = mock.getConversationsMock();
    return res.json({ ok: true, data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetOrCreateByPhone: RequestHandler = async (req, res) => {
  try {
    const phone = req.params.phone;
    console.log('[conversations] handleGetOrCreateByPhone called for phone:', phone);
    if (!phone) {
      console.warn('[conversations] phone param missing');
      return res.status(400).json({ ok: false, error: "phone required" });
    }

    const conv = mock.getOrCreateConversationByPhoneMock(phone);
    return res.json({ ok: true, data: conv });
  } catch (err: any) {
    console.error('[conversations] unhandled error', err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
