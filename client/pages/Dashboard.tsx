import { useMemo, useState } from "react";
import Layout, { TabKey } from "@/components/Layout";
import ChatWindow, { Message } from "@/components/Chat/ChatWindow";
import ContactListItem from "@/components/Chat/ContactListItem";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const userName = localStorage.getItem("userName") || "Agente";
  const userRole = localStorage.getItem("userRole") || "";
  const [activeTab, setActiveTab] = useState<TabKey>("conversas");

  // Mock data (to be wired to backend)
  const contacts = useMemo(
    () => [
      {
        id: "1",
        name: "Maria Silva",
        lastMessage: "Obrigada!",
        time: "09:24",
        unread: 2,
        status: "online",
      },
      {
        id: "2",
        name: "João Pedro",
        lastMessage: "Podemos reagendar?",
        time: "Ontem",
        unread: 0,
        status: "último visto 21:02",
      },
      {
        id: "3",
        name: "Clínica Viva",
        lastMessage: "Bot: seu agendamento foi confirmado.",
        time: "Seg",
        unread: 0,
        status: "bot ativo",
      },
    ],
    [],
  );
  const [selectedId, setSelectedId] = useState("1");
  const [input, setInput] = useState("");

  const messages: Record<string, Message[]> = {
    "1": [
      {
        id: "m1",
        sender: "bot",
        text: "Olá Maria! Posso ajudar?",
        time: "09:20",
      },
      {
        id: "m2",
        sender: "user",
        text: "Quero saber sobre horários.",
        time: "09:22",
      },
      {
        id: "m3",
        sender: "agent",
        text: "Temos às 15h e 17h hoje.",
        time: "09:23",
      },
      { id: "m4", sender: "user", text: "Obrigada!", time: "09:24" },
    ],
    "2": [
      { id: "m1", sender: "user", text: "Podemos reagendar?", time: "21:00" },
      {
        id: "m2",
        sender: "bot",
        text: "Claro! Para quando deseja?",
        time: "21:01",
      },
    ],
    "3": [
      {
        id: "m1",
        sender: "bot",
        text: "Seu agendamento foi confirmado para 10:00.",
        time: "08:10",
      },
    ],
  };

  const activeContact = contacts.find((c) => c.id === selectedId)!;

  const handleSend = async () => {
    if (!input.trim()) return;
    // Would call /api/messages/send here
    messages[selectedId] = [
      ...messages[selectedId],
      {
        id: crypto.randomUUID(),
        sender: "user",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
    setInput("");
  };

  return (
    <Layout userName={userName} userRole={userRole} active={activeTab} onChange={setActiveTab}>
      {activeTab === "conversas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Contacts */}
          <div className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-border/60 bg-background/60 backdrop-blur p-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="font-medium">Conversas</div>
              <div className="text-xs text-muted-foreground">
                {contacts.length} contatos
              </div>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {contacts.map((c) => (
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
              contactName={activeContact.name}
              status={activeContact.status}
              messages={messages[selectedId]}
            />
            <div className="p-3 border-t border-border/60 flex items-center gap-2">
              <button className="h-10 w-10 rounded-xl border border-input bg-background/60 hover:bg-sidebar-accent/70">
                <Paperclip className="h-4 w-4 m-auto" />
              </button>
              <button
                className="h-10 w-10 rounded-xl border border-input bg-background/60 hover:bg-sidebar-accent/70"
                onClick={() => setInput((v) => v + " 🙂")}
              >
                <Smile className="h-4 w-4 m-auto" />
              </button>
              <input
                className={cn(
                  "flex-1 h-11 rounded-xl bg-background/60 border border-input px-3 outline-none text-sm focus:ring-2 focus:ring-ring focus:border-transparent",
                )}
                placeholder="Escreva uma mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <Button onClick={handleSend} className="h-11 px-4">
                <Send className="h-4 w-4" /> Enviar
              </Button>
            </div>
          </div>
        </div>
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
    </Layout>
  );
}
