import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

export interface Message {
  id: string;
  sender: "user" | "agent" | "bot";
  text: string;
  time: string;
}

interface ChatWindowProps {
  messages: Message[];
  contactName: string;
  status?: string;
}

export default function ChatWindow({ messages, contactName, status }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [input, setInput] = useState("");

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  const handleSend = (text?: string) => {
    const t = text ?? input.trim();
    if (!t) return;
    const now = new Date();
    const hm = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = { id: `local-${Date.now()}`, sender: "agent", text: t, time: hm };
    setLocalMessages((s) => [...s, newMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black to-[#001A10] rounded-t-xl relative">
      {/* Header (overlay) */}
      <div className="absolute top-0 left-0 right-0 h-16 z-10 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[#00FF99]/20" role="banner" aria-label="Informações do contato">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5 text-text-secondary" />
          </button>
          <div>
            <div className="font-medium text-white">{contactName}</div>
            <div className="text-xs text-text-secondary mt-0.5">{status || "online"}</div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingTop: 64, paddingBottom: 96 }} role="list" aria-label="Mensagens">
        <ul className="space-y-3">
          {localMessages.map((m) => (
            <li key={m.id} role="listitem" className={(m.sender === "agent" ? "flex justify-end" : "flex justify-start") + " message-fade"}>
              <div style={{ maxWidth: '75%' }}>
                <div style={m.sender === "agent" ? { background: 'linear-gradient(90deg,#008A45,#00FF99)', color: '#00110a', padding: '10px', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,255,102,0.08)' } : { background: '#1A1A1A', color: '#E6E6E6', padding: '10px', borderRadius: 18 }}>
                  <div>{m.text}</div>
                </div>
                <div className={m.sender === "agent" ? "text-[10px] mt-1 text-text-secondary text-right" : "text-[10px] mt-1 text-text-secondary text-left"}>
                  {m.time}
                </div>
              </div>
            </li>
          ))}
          <div ref={bottomRef} />
        </ul>
      </div>

      {/* Input - sticky footer */}
      <div className="sticky bottom-0 bg-black/70 backdrop-blur-md px-4 py-3 border-t border-[#00FF99]/20 z-20">
        <div className="flex items-center gap-3">
          <input
            aria-label="Digite uma mensagem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            className="flex-1 h-11 rounded-xl bg-transparent border border-input px-3 outline-none text-sm text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-[#00FF66]/30"
            placeholder="Digite uma mensagem..."
          />
        </div>
      </div>
    </div>
  );
}
