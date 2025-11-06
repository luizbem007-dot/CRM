import { useEffect, useState, useRef } from "react";
import { FIQON_API } from "@/lib/fiqon";
import { supabase } from "@/lib/supabase";

export interface FiqonMessage {
  id: string;
  client_id?: string;
  user_id?: string;
  phone?: string;
  nome?: string;
  message?: string;
  created_at?: string;
  status?: string;
}

export default function useFiqonMessages(pollInterval = 0) {
  const [messages, setMessages] = useState<FiqonMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const channelRef = useRef<any>(null);

  const normalize = (d: any): FiqonMessage => ({
    id: String(d.id ?? d.ID ?? d.pk ?? Math.random()),
    client_id: d.client_id ?? d.cliente_id ?? d.clientId ?? d.client ?? d.client_id,
    user_id: d.user_id ?? d.userId ?? d.userid ?? d.user ?? undefined,
    phone: d.phone ?? d.telefone ?? d.numero ?? d.msisdn ?? undefined,
    nome: d.nome ?? d.name ?? d.nome_cliente ?? d.client_name,
    message: d.message ?? d.mensagem ?? d.text ?? d.body,
    created_at: d.created_at ?? d.inserted_at ?? d.ts ?? d.created_at,
    status: d.status ?? d.st ?? d.state,
  });

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(FIQON_API.url, {
        method: "GET",
        headers: FIQON_API.headers as Record<string, string>,
        signal: controller.signal,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`FIQON fetch failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(normalize);
        setMessages(normalized);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // initial load
    fetchMessages();

    // If pollInterval > 0, set up polling (deprecated when using realtime)
    let interval: any = null;
    if (pollInterval && pollInterval > 0) {
      interval = setInterval(() => {
        if (!mounted) return;
        fetchMessages();
      }, pollInterval);
    }

    // Realtime subscription with exponential backoff reconnection
    const backoffRef = { current: 1000 };
    let retryTimer: any = null;

    const subscribeRealtime = async () => {
      // cleanup previous
      try {
        if (channelRef.current && typeof (channelRef.current as any).unsubscribe === "function") {
          (channelRef.current as any).unsubscribe();
        }
      } catch (e) {
        // ignore
      }

      try {
        const channel = supabase
          .channel("public:fiqon")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "fiqon" },
            (payload) => {
              if (!mounted) return;
              const newRow = payload.new;
              console.log("🔴 Nova mensagem recebida via Realtime", newRow);
              const normalized = normalize(newRow);
              setMessages((prev) => {
                if (prev.find((m) => String(m.id) === String(normalized.id))) return prev;
                return [...prev, normalized];
              });
            },
          )
          .subscribe();

        channelRef.current = channel;
        backoffRef.current = 1000; // reset backoff on success
      } catch (err) {
        console.warn("Realtime subscription failed, retrying:", err);
        // schedule retry with backoff
        retryTimer = setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 2, 30000);
          subscribeRealtime();
        }, backoffRef.current);
      }
    };

    subscribeRealtime();

    // Try to re-subscribe when browser comes back online or tab becomes visible
    const onOnline = () => {
      if (!mounted) return;
      subscribeRealtime();
    };
    const onVisible = () => {
      if (!mounted) return;
      if (document.visibilityState === "visible") subscribeRealtime();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      abortRef.current?.abort();
      // unsubscribe
      if (channelRef.current && typeof (channelRef.current as any).unsubscribe === "function") {
        try {
          (channelRef.current as any).unsubscribe();
        } catch (e) {
          console.warn("Error unsubscribing realtime channel", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval]);

  return { messages, loading, error, refetch: fetchMessages };
}
