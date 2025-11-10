import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ChatWindow, { Message } from "@/components/Chat/ChatWindow";
import ContactListItem from "@/components/Chat/ContactListItem";

type TabKey = "conversas" | "configuracoes" | "integracoes";

const mockConversations = [
  {
    id: "luiz-fernando",
    name: "Luiz Fernando",
    lastMessage: "E aí, tudo certo por aí?",
    time: "08:35",
    status: "online",
    messages: [
      { id: "m1", sender: "agent", text: "E aí, tudo certo por aí?", time: "08:35" },
      { id: "m2", sender: "user", text: "Tudo sim! Obrigado.", time: "08:36" },
      { id: "m3", sender: "agent", text: "Ótimo, vamos em frente.", time: "08:37" },
    ] as Message[],
  },
  {
    id: "mariana-lopes",
    name: "Mariana Lopes",
    lastMessage: "Adorei sua ideia, depois me conta mais!",
    time: "09:10",
    status: "offline",
    messages: [
      { id: "m1", sender: "user", text: "Adorei sua ideia, depois me conta mais!", time: "09:10" },
      { id: "m2", sender: "agent", text: "Combinado, te mando os detalhes.", time: "09:12" },
    ] as Message[],
  },
  {
    id: "rafael-souza",
    name: "Rafael Souza",
    lastMessage: "Perfeito! Vamos marcar isso.",
    time: "11:45",
    status: "online",
    messages: [
      { id: "m1", sender: "agent", text: "Perfeito! Vamos marcar isso.", time: "11:45" },
      { id: "m2", sender: "user", text: "Beleza, quando fica bom pra você?", time: "11:46" },
      { id: "m3", sender: "agent", text: "Amanhã pela manhã funciona.", time: "11:47" },
    ] as Message[],
  },
];

export default function Dashboard() {
  const userName = localStorage.getItem("userName") || "Agente";
  const userRole = localStorage.getItem("userRole") || "";
  const [activeTab, setActiveTab] = useState<TabKey>("conversas");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [conversationActive, setConversationActive] = useState(false);

  useEffect(() => {
    if (!selectedId) setSelectedId(mockConversations[0].id);
  }, [selectedId]);

  const selectedConversation = mockConversations.find((c) => c.id === selectedId) ?? mockConversations[0];
  const displayMessages = selectedConversation ? selectedConversation.messages : [];

  return (
    <Layout userName={userName} userRole={userRole} active={activeTab as any} onChange={setActiveTab as any}>
      {activeTab === "conversas" && (
        <div className={"flex h-[calc(100vh-96px)] gap-4 " + (conversationActive ? "justify-center items-start" : "")}>
          {/* Sidebar - conversations list */}
          <aside className={"w-[360px] rounded-2xl glass-panel p-3 overflow-hidden flex flex-col transition-transform duration-300 " + (conversationActive ? "hidden" : "block") }>
            <div className="flex items-center justify-between px-2 pb-3">
              <div>
                <div className="text-xl font-semibold">Conversas</div>
                <div className="text-sm text-[var(--text-secondary)]">{mockConversations.length} contatos</div>
              </div>
              <div className="text-sm text-[var(--text-secondary)]"> </div>
            </div>

            <div className="mt-2 mb-3">
              <input aria-label="Busca de conversas" placeholder="Busca rápida" className="w-full h-11 rounded-xl bg-transparent border border-[var(--border-weak)] px-3 outline-none text-sm text-[var(--text-primary)] neon-placeholder" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {mockConversations.map((c) => (
                <ContactListItem
                  key={c.id}
                  name={c.name}
                  lastMessage={c.lastMessage}
                  time={c.time}
                  status={c.status}
                  active={selectedId === c.id}
                  onClick={() => { setSelectedId(c.id); setConversationActive(true); }}
                />
              ))}
            </div>
          </aside>

          {/* Chat area */}
          <main className={"flex-1 rounded-2xl overflow-hidden chat-bg flex flex-col transition-all duration-300 " }>
            <div className={conversationActive ? "flex-1 min-h-0 w-full max-w-4xl mx-auto" : "flex-1 min-h-0"}>
              <ChatWindow onBack={() => setConversationActive(false)} isConversationMode={conversationActive} contactName={selectedConversation.name} status={selectedConversation.status} messages={displayMessages} />
            </div>
          </main>
        </div>
      )}

      {activeTab === "configuracoes" && (
        <div className="rounded-2xl border border-[var(--border-weak)] bg-transparent p-8 text-center">
          <div className="text-lg font-medium">Configurações</div>
          <div className="text-sm text-[var(--text-secondary)] mt-2">Em desenvolvimento</div>
        </div>
      )}

      {activeTab === "integracoes" && (
        <div className="rounded-2xl border border-[var(--border-weak)] bg-transparent p-8 text-center">
          <div className="text-lg font-medium">Integrações</div>
          <div className="text-sm text-[var(--text-secondary)] mt-2">Em desenvolvimento</div>
        </div>
      )}
    </Layout>
  );
}
