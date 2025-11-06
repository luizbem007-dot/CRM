import { useEffect, useState, useRef } from "react";
import { FIQON_API } from "@/lib/fiqon";

export interface FiqonMessage {
  id: string;
  client_id?: string;
  nome?: string;
  message?: string;
  created_at?: string;
  status?: string;
}

export default function useFiqonMessages(pollInterval = 2000) {
  const [messages, setMessages] = useState<FiqonMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
        // Normalize field names
        const normalized = data.map((d: any) => ({
          id: d.id ?? d.ID ?? d.pk ?? String(d.id ?? Math.random()),
          client_id: d.client_id ?? d.cliente_id ?? d.clientId ?? d.client ?? d.client_id,
          nome: d.nome ?? d.name ?? d.nome_cliente ?? d.client_name,
          message: d.message ?? d.mensagem ?? d.text ?? d.body,
          created_at: d.created_at ?? d.created_at ?? d.inserted_at ?? d.ts,
          status: d.status ?? d.st ?? d.state,
        }));
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
    fetchMessages();
    const interval = setInterval(() => {
      if (!mounted) return;
      fetchMessages();
    }, pollInterval);
    return () => {
      mounted = false;
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [pollInterval]);

  return { messages, loading, error, refetch: fetchMessages };
}
