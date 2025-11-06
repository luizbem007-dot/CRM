import React, { useEffect, useState } from "react";
import Layout, { TabKey } from "@/components/Layout";
import ChatWindow, { Message } from "@/components/Chat/ChatWindow";
const SaveContactModal = React.lazy(() => import("@/components/Chat/SaveContactModal"));
import ContactListItem from "@/components/Chat/ContactListItem";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import useFiqonMessages from "@/hooks/use-fiqon-messages";
import { sendTextZapi } from "@/lib/requesters/zapi";

export default function Dashboard() {
  const userName = localStorage.getItem("userName") || "Agente";
  const userRole = localStorage.getItem("userRole") || "";
  const [activeTab, setActiveTab] = useState<TabKey>("conversas");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lastOpenedPhone, setLastOpenedPhone] = useState<string | null>(null);

  // FIQON data source (realtime via Supabase)
  const { messages: fiqonMessages, loading: fiqonLoading, appendLocalMessage, refetch: refetchFiqon } = useFiqonMessages(0);
  const [sending, setSending] = useState(false);
  const [responseZAPI, setResponseZAPI] = useState<any>(null);

  // Group messages by phone (preferred) or user_id or client_id
  const messagesByContact: Record<string, Message[]> = {};
  fiqonMessages.forEach((m) => {
    const key = String(m.phone ?? m.user_id ?? m.client_id ?? m.id ?? "unknown");
    if (!messagesByContact[key]) messagesByContact[key] = [];
    const sender = (m.status || "").toLowerCase().includes("bot") || (m.message || "").startsWith("Bot:") ? "bot" : "user";
    const time = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    messagesByContact[key].push({ id: String(m.id), sender: sender as any, text: m.message ?? "", time, ts: m.created_at } as any);
  });

  // Build conversations list from messagesByContact
  const conversations = Object.keys(messagesByContact).map((contactKey) => {
    const list = messagesByContact[contactKey].slice();
    // sort messages by ts ascending
    list.sort((a: any, b: any) => {
      const ta = a.ts ? new Date(a.ts).getTime() : 0;
      const tb = b.ts ? new Date(b.ts).getTime() : 0;
      return ta - tb;
    });
    const last = list[list.length - 1];

    // find name from fiqonMessages for this contact
    const meta = fiqonMessages.find((m) => String(m.phone ?? m.user_id ?? m.client_id ?? m.id) === contactKey);
    const name = meta?.nome ?? `Cliente ${contactKey}`;
    const lastTimestamp = last?.ts ?? meta?.created_at ?? null;

    return {
      id: contactKey,
      name,
      lastMessage: last?.text ?? "",
      time: last?.time ?? "",
      unread: 0,
      status: last?.sender === "bot" ? "bot ativo" : "online",
      lastTimestamp,
      messages: list,
    } as any;
  }).sort((a: any, b: any) => {
    // sort by lastTimestamp desc
    const ta = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
    const tb = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
    return tb - ta;
  });

  // Ensure selectedId defaults to first conversation
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
    // if selectedId exists but not in conversations, reset
    if (selectedId && !conversations.find((c) => c.id === selectedId)) {
      setSelectedId(conversations[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiqonMessages]);

  const displayMessages = (selectedId && messagesByContact[selectedId])
    ? messagesByContact[selectedId].slice().sort((a: any, b: any) => {
        const ta = a.ts ? new Date(a.ts).getTime() : 0;
        const tb = b.ts ? new Date(b.ts).getTime() : 0;
        return ta - tb;
      })
    : [];

  const [conversationMeta, setConversationMeta] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      if (!selectedId) return setConversationMeta(null);
      try {
        const resp = await fetch(`/api/conversations/by-phone/${encodeURIComponent(selectedId)}`);
        if (!resp.ok) return setConversationMeta(null);
        const data = await resp.json();
        if (!cancelled) setConversationMeta(data.data ?? null);
      } catch (e) {
        console.error('Could not load conversation meta', e);
        setConversationMeta(null);
      }
    };
    loadMeta();
    return () => { cancelled = true; };
  }, [selectedId]);

  useEffect(() => {
    // If conversation meta has no name, open save modal once per phone
    if (!conversationMeta) return;
    const phone = selectedId;
    if (phone && (!conversationMeta.name || conversationMeta.name === "") && lastOpenedPhone !== phone) {
      setShowSaveModal(true);
      setLastOpenedPhone(phone);
    }
  }, [conversationMeta, selectedId, lastOpenedPhone]);

  const toggleBot = async (enabled: boolean) => {
    if (!conversationMeta?.id) return;
    try {
      await fetch(`/api/conversations/${conversationMeta.id}/bot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
      setConversationMeta((m: any) => ({ ...m, bot_enabled: enabled }));
    } catch (e) { console.error(e); }
  };

  const assignConversation = async () => {
    if (!conversationMeta?.id) return;
    try {
      const user = localStorage.getItem('userName') || 'Agente';
      await fetch(`/api/conversations/${conversationMeta.id}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user }) });
      setConversationMeta((m: any) => ({ ...m, assigned_to: user, assigned_at: new Date().toISOString() }));
    } catch (e) { console.error(e); }
  };

  const releaseConversation = async () => {
    if (!conversationMeta?.id) return;
    try {
      await fetch(`/api/conversations/${conversationMeta.id}/release`, { method: 'POST' });
      setConversationMeta((m: any) => ({ ...m, assigned_to: null, assigned_at: null }));
    } catch (e) { console.error(e); }
  };

  const saveContact = async () => {
    if (!selectedId) return;
    // open modal to save contact instead of prompt
    setShowSaveModal(true);
  };

  const addNote = async () => {
    if (!conversationMeta?.id) return alert('Selecione uma conversa');
    const text = window.prompt('Nova nota interna');
    if (!text) return;
    try {
      await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: conversationMeta.id, author: localStorage.getItem('userName') || 'Agente', text }) });
      alert('Nota adicionada');
    } catch (e) { console.error(e); alert('Erro adicionando nota'); }
  };

  const updateTags = async (tags: string[]) => {
    if (!conversationMeta?.id) return;
    try {
      await fetch(`/api/conversations/${conversationMeta.id}/tags`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tags }) });
      setConversationMeta((m: any) => ({ ...m, tags }));
    } catch (e) { console.error(e); }
  };

  const setStatus = async (status: string) => {
    if (!conversationMeta?.id) return;
    try {
      await fetch(`/api/conversations/${conversationMeta.id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setConversationMeta((m: any) => ({ ...m, status }));
    } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedId) return;

    const phone = selectedId;
    const text = input.trim();

    // Z-API endpoint
    const ZAPI_URL = "https://api.z-api.io/instances/3E97080A6033712B38C3922F34499783/token/0B33D7C0F338A98F82743FEE/send-text";

    try {
      setSending(true);
      // create a client_message_id for deduplication
      const client_message_id = crypto.randomUUID();
      const optimistic = {
        id: `local-${client_message_id}`,
        client_message_id,
        phone,
        message: text,
        fromMe: true,
        name: localStorage.getItem("userName") || "Agente",
        created_at: new Date().toISOString(),
      } as any;

      // append optimistic message immediately
      try {
        appendLocalMessage(optimistic);
      } catch (e) {
        /* ignore */
      }

      // 1) Send to external Z-API via Requester
      const zapiResult = await sendTextZapi(phone, text);
      // store for audit/logging/UI
      setResponseZAPI(zapiResult);
      if (!zapiResult.ok) {
        console.warn("Z-API returned error, but will still record message locally and in Supabase", zapiResult.status, zapiResult.bodyText);
        const { toast } = await import("sonner");
        if (zapiResult.status === 400 || zapiResult.status === 401) {
          toast.error("❌ Erro ao enviar mensagem. Verifique se o número está correto e o WhatsApp está conectado.");
        } else if (zapiResult.status === 404) {
          toast.error("⚠️ O número informado não possui WhatsApp ativo.");
        } else {
          toast.error("Erro ao enviar mensagem (Z-API)");
        }
        // DO NOT return: continue to insert message into Supabase so optimistic message is persisted
      }

      // 2) If Z-API succeeded, insert into Supabase so Realtime picks it up
      // Use server endpoint to create the message in Supabase to avoid client-side supabase-js insert issues
      try {
        const resp = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_message_id,
            user_id: selectedId,
            phone,
            message: text,
            name: localStorage.getItem('userName') || 'Agente',
            source: 'CRM',
            fromMe: true,
          }),
        });

        let bodyText = '';
        try {
          bodyText = await resp.text();
        } catch (e) {
          try { bodyText = await resp.clone().text(); } catch (e2) { bodyText = String(e2); }
        }

        if (!resp.ok) {
          console.error('Server /api/messages returned error', resp.status, bodyText);
          const { toast } = await import('sonner');
          toast.error('Erro ao enviar mensagem (server)');
          setSending(false);
          return;
        }
      } catch (e) {
        console.error('Error calling /api/messages:', e);
        const { toast } = await import('sonner');
        toast.error('Erro ao enviar mensagem (server)');
        setSending(false);
        return;
      }

      // Clear input. Realtime subscription will replace optimistic message with official row
      setInput("");
      const { toast } = await import("sonner");
      toast.success("Mensagem enviada");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      const { toast } = await import("sonner");
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout userName={userName} userRole={userRole} active={activeTab} onChange={setActiveTab}>
      {activeTab === "conversas" && (
        (conversations.length === 0) ? (
          <div className="rounded-2xl border border-border/60 bg-background/60 p-8 text-center">
            <div className="text-lg font-medium">Nenhuma conversa ainda</div>
            <div className="text-sm text-muted-foreground mt-2">As conversas aparecerão automaticamente quando novas mensagens forem recebidas.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Contacts */}
            <div className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-border/60 bg-background/60 backdrop-blur p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="font-medium">Conversas</div>
                <div className="text-xs text-muted-foreground">{conversations.length} contatos</div>
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {conversations.map((c) => (
                  <ContactListItem
                    key={c.id}
                    name={c.name}
                    lastMessage={c.lastMessage}
                    time={c.time}
                    status={c.status}
                    unread={c.unread}
                    active={selectedId === c.id}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-8 xl:col-span-9 rounded-2xl border border-border/60 bg-background/60 backdrop-blur flex flex-col h-[70vh]">
              <ChatWindow
                contactName={(conversations.find((x) => x.id === selectedId)?.name) ?? "Selecione uma conversa"}
                status={(conversations.find((x) => x.id === selectedId)?.status) ?? ""
                }
                messages={displayMessages}
                onSend={handleSend}
                conversation={conversationMeta}
                onToggleBot={toggleBot}
                onAssign={assignConversation}
                onRelease={releaseConversation}
                onSaveContact={saveContact}
                onAddNote={addNote}
                onUpdateTags={updateTags}
                onSetStatus={setStatus}
              />
              <div className="p-3 border-t border-border/60 flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl border border-input bg-background/60 hover:bg-sidebar-accent/70">
                  <Paperclip className="h-4 w-4 m-auto" />
                </button>
                <button className="h-10 w-10 rounded-xl border border-input bg-background/60 hover:bg-sidebar-accent/70" onClick={() => setInput((v) => v + " 🙂") }>
                  <Smile className="h-4 w-4 m-auto" />
                </button>
                <input
                  className={cn(
                    "flex-1 h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm focus:ring-2 focus:ring-ring focus:border-transparent",
                  )}
                  placeholder="Escreva uma mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                />
                <Button onClick={handleSend} disabled={sending} className="h-11 px-4"><Send className="h-4 w-4" /> Enviar</Button>
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === "relatorios" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            {
              title: "Conversas no período",
              value: "1.284",
              sub: "+18% vs semana passada",
            },
            {
              title: "Tempo médio de resposta",
              value: "42s",
              sub: "Meta: < 60s",
            },
            {
              title: "Respostas automáticas",
              value: "67%",
              sub: "33% manuais",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border/60 bg-background/60 p-5"
            >
              <div className="text-sm text-muted-foreground">{c.title}</div>
              <div className="text-3xl font-bold mt-1">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
              <div className="mt-4 h-28 rounded-xl bg-sidebar-accent/60" />
            </div>
          ))}
          <div className="xl:col-span-3 rounded-2xl border border-border/60 bg-background/60 p-5">
            <div className="text-sm text-muted-foreground">
              Gráfico (exemplo)
            </div>
            <div className="mt-3 h-64 rounded-xl bg-sidebar-accent/60" />
          </div>
        </div>
      )}

      {activeTab === "contatos" && (
        <div className="rounded-2xl border border-border/60 bg-background/60 p-5">
          <div className="text-sm text-muted-foreground">Lista de contatos</div>
          <div className="mt-3 h-64 rounded-xl bg-sidebar-accent/60" />
        </div>
      )}

      {activeTab === "configuracoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3">
            <div className="font-medium">Agente de IA</div>
            <label className="text-sm">API Key FIQON</label>
            <input
              className="h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm"
              placeholder="FIQON_API_KEY"
            />
            <label className="text-sm">Webhook URL</label>
            <input
              className="h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm"
              placeholder="https://.../webhook"
            />
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm">Modo bot ativo</span>
              <input type="checkbox" defaultChecked className="h-5 w-10" />
            </div>
            <Button className="mt-2">Salvar</Button>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3">
            <div className="font-medium">Mensagens automáticas</div>
            <textarea
              className="min-h-40 rounded-xl bg-background/60 border border-input px-3 py-2 outline-none text-sm"
              placeholder="Ex: Olá! Como posso ajudar?"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm"
                placeholder="Horário início"
              />
              <input
                className="h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm"
                placeholder="Horário fim"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "integracoes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { name: "FIQON", status: "✅ Conectado" },
            { name: "Twilio", status: "❌ Desconectado" },
            { name: "Meta API", status: "❌ Desconectado" },
            { name: "HubSpot", status: "❌ Desconectado" },
          ].map((i) => (
            <div
              key={i.name}
              className="rounded-2xl border border-border/60 bg-background/60 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{i.name}</div>
                <div
                  className={cn(
                    "text-xs",
                    i.status.includes("✅")
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {i.status}
                </div>
              </div>
              <div className="mt-3 h-24 rounded-xl bg-sidebar-accent/60" />
              <div className="mt-3 flex gap-2">
                <Button variant="secondary">Conectar</Button>
                <Button variant="outline">Testar</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <SaveContactModal
        phone={selectedId ?? ""}
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaved={async () => {
          try {
            if (typeof refetchFiqon === "function") await refetchFiqon();
            if (selectedId) {
              const resp = await fetch(`/api/conversations/by-phone/${encodeURIComponent(selectedId)}`);
              if (resp.ok) {
                const data = await resp.json();
                setConversationMeta(data.data ?? null);
              }
            }
          } catch (e) {
            console.error("Error refreshing after save", e);
          } finally {
            setShowSaveModal(false);
          }
        }}
      />
    </Layout>
  );
}
