import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

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

    const supabase = getSupabase();
    const update = await supabase
      .from("conversations")
      .update({ bot_enabled: enabled })
      .eq("id", id)
      .select();
    if (update.error)
      return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
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

    const supabase = getSupabase();
    const update = await supabase
      .from("conversations")
      .update({ assigned_to: user, assigned_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (update.error)
      return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
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
    const supabase = getSupabase();
    const update = await supabase
      .from("conversations")
      .update({ assigned_to: null, assigned_at: null })
      .eq("id", id)
      .select();
    if (update.error)
      return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
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
    const supabase = getSupabase();
    const update = await supabase
      .from("conversations")
      .update({ status })
      .eq("id", id)
      .select();
    if (update.error)
      return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
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
    const supabase = getSupabase();
    const update = await supabase
      .from("conversations")
      .update({ tags })
      .eq("id", id)
      .select();
    if (update.error)
      return res.status(500).json({ ok: false, error: update.error });
    return res.json({ ok: true, data: update.data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};

export const handleGetConversations: RequestHandler = async (_req, res) => {
  try {
    const supabase = getSupabase();
    const q = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (q.error) return res.status(500).json({ ok: false, error: q.error });
    return res.json({ ok: true, data: q.data });
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

    const supabase = getSupabase();
    console.log('[conversations] querying conversations for phone', phone);
    const q = await supabase
      .from("conversations")
      .select("*")
      .eq("phone", phone)
      .limit(1);

    if (q.error) {
      console.error('[conversations] supabase select error', q.error);
      // If table is missing (PGRST205), return a synthetic conversation to avoid 500 in dev
      if ((q.error as any).code === 'PGRST205' || String((q.error as any).message).includes("Could not find the table")) {
        console.warn('[conversations] Table missing in Supabase. Returning placeholder conversation. Run migrations to create tables.');
        return res.json({ ok: true, data: { id: null, phone, name: `Cliente ${phone}`, bot_enabled: false, status: 'open', created_at: new Date().toISOString() } });
      }
      return res.status(500).json({ ok: false, error: String(q.error) });
    }

    if (q.data && q.data.length > 0) {
      console.log('[conversations] found existing conversation for', phone);
      return res.json({ ok: true, data: q.data[0] });
    }

    console.log('[conversations] no conversation found; inserting new for', phone);
    const ins = await supabase
      .from("conversations")
      .insert({ phone, created_at: new Date().toISOString() })
      .select();

    if (ins.error) {
      // If insert failed because table missing, return placeholder instead of 500
      console.error('[conversations] supabase insert error', ins.error);
      if ((ins.error as any).code === 'PGRST205' || String((ins.error as any).message).includes("Could not find the table")) {
        console.warn('[conversations] Table missing in Supabase during insert. Returning placeholder conversation.');
        return res.json({ ok: true, data: { id: null, phone, name: `Cliente ${phone}`, bot_enabled: false, status: 'open', created_at: new Date().toISOString() } });
      }
      return res.status(500).json({ ok: false, error: String(ins.error) });
    }

    console.log('[conversations] inserted conversation for', phone);
    return res.json({ ok: true, data: ins.data[0] });
  } catch (err: any) {
    console.error('[conversations] unhandled error', err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? String(err) });
  }
};
