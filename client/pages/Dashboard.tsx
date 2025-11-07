import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!selectedId) setSelectedId(mockConversations[0].id);
  }, [selectedId]);

  const selectedConversation = mockConversations.find((c) => c.id === selectedId) ?? mockConversations[0];
  const displayMessages = selectedConversation ? selectedConversation.messages : [];

  return (
    <Layout userName={userName} userRole={userRole} active={activeTab as any} onChange={setActiveTab as any}>
      {activeTab === "conversas" && (
        <div>
          <div className="mb-4 rounded-2xl border border-border/60 bg-background/60 p-4 flex items-center gap-4">
            <div>
              <div className="text-lg font-bold">Central de Conversas</div>
              <div className="text-sm text-text-secondary">Painel</div>
            </div>
            <div className="flex-1">
              <input aria-label="Busca de conversas" placeholder="Busca rápida" className="w-full h-11 rounded-xl bg-background/20 border border-input px-3 outline-none text-sm neon-placeholder" />
            </div>
            <div className="text-sm text-text-secondary">{mockConversations.length} contatos</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 xl:col-span-3 rounded-2xl p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="font-medium">Conversas</div>
                <div className="text-xs text-muted-foreground">3 contatos</div>
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {mockConversations.map((c) => (
                  <ContactListItem
                    key={c.id}
                    name={c.name}
                    lastMessage={c.lastMessage}
                    time={c.time}
                    status={c.status}
                    active={selectedId === c.id}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9 rounded-2xl flex flex-col h-[70vh] overflow-hidden">
              <ChatWindow contactName={selectedConversation.name} status={selectedConversation.status} messages={displayMessages} />

              <div className="p-3 border-t border-border/60 flex items-center gap-2 bg-transparent">
                <input
                  className="flex-1 h-11 rounded-xl bg-background/20 border border-input px-3 outline-none text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-[#00FF66] focus:border-transparent"
                  placeholder="Digite uma mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!input.trim()) return;
                      setInput("");
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "configuracoes" && (
        <div className="rounded-2xl border border-border/60 bg-background/60 p-8 text-center">
          <div className="text-lg font-medium">Configurações</div>
          <div className="text-sm text-muted-foreground mt-2">Em desenvolvimento</div>
        </div>
      )}

      {activeTab === "integracoes" && (
        <div className="rounded-2xl border border-border/60 bg-background/60 p-8 text-center">
          <div className="text-lg font-medium">Integrações</div>
          <div className="text-sm text-muted-foreground mt-2">Em desenvolvimento</div>
        </div>
      )}
    </Layout>
  );
}
