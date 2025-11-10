import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Paperclip, Smile, Send, X } from "lucide-react";

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
  onBack?: () => void;
  isConversationMode?: boolean;
}

function generatePhone(name?: string) {
  if (!name) return "+55 27 99255-1404";
  // deterministic pseudo-phone based on name
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  const n = String(10000000 + (sum % 90000000)).padStart(8, "0");
  return `+55 27 9${n.slice(0,4)}-${n.slice(4)}`;
}

import { createPortal } from 'react-dom';

export default function ChatWindow({ messages, contactName, status, onBack, isConversationMode }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);

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

  const phone = generatePhone(contactName);
  const savedBy = localStorage.getItem("userName") || "Usuário";

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 h-20 z-10 bg-func-bg/60 backdrop-blur-md flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-weak)' }}>
        <div className="flex items-center gap-4">
          {isConversationMode ? (
            <button onClick={() => onBack && onBack()} className="p-2 rounded-md bg-transparent focus:outline-none" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          ) : (
            <button className="md:hidden p-2 rounded-md bg-transparent focus:outline-none" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          )}

          <div className="h-10 w-10 rounded-full bg-[linear-gradient(135deg,#00FF84,#008A45)] flex items-center justify-center font-semibold text-black">{contactName ? contactName[0] : "U"}</div>

          <div className="cursor-pointer" onClick={() => setShowInfo(true)} role="button" aria-label={`Abrir informações de ${contactName}`}>
            <div className="font-semibold text-[var(--text-primary)]">{contactName}</div>
            <div className="text-xs text-[var(--text-secondary)]"><span className="text-[var(--neon-green)]">{phone}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-[var(--hover-neon)]" aria-label="Pesquisar">
            <Paperclip className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-md hover:bg-[var(--hover-neon)]" aria-label="Mais">
            <Smile className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-8" style={{ paddingTop: 86, paddingBottom: 112 }} role="list" aria-label="Mensagens">
        <ul className="space-y-4">
          {localMessages.map((m) => (
            <li key={m.id} role="listitem" className={(m.sender === "agent" ? "flex justify-end" : "flex justify-start") + " message-fade"}>
              <div style={{ maxWidth: '72%' }}>
                <div className={m.sender === "agent" ? "message-sent" : "message-recv"}>
                  <div>{m.text}</div>
                </div>
                <div className={m.sender === "agent" ? "text-[10px] mt-1 text-[var(--text-secondary)] text-right" : "text-[10px] mt-1 text-[var(--text-secondary)] text-left"}>
                  {m.time}
                </div>
              </div>
            </li>
          ))}
          <div ref={bottomRef} />
        </ul>
      </div>

      {/* Input - sticky footer */}
      <div className="sticky bottom-0 bg-func-bg/70 backdrop-blur-md px-6 py-4 border-t z-20" style={{ borderColor: 'var(--border-weak)' }}>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-[var(--hover-neon)]" aria-label="Anexar">
            <Paperclip className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-md hover:bg-[var(--hover-neon)] md:hidden" aria-label="Emoji">
            <Smile className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>

          <input
            aria-label="Digite uma mensagem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            className="flex-1 h-12 rounded-[12px] chat-input px-4 outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            placeholder="Digite uma mensagem..."
          />

          <button onClick={() => handleSend()} className="ml-2 h-12 w-12 rounded-full bg-[var(--neon-green)] flex items-center justify-center shadow-md" aria-label="Enviar">
            <Send className="h-5 w-5 text-black" />
          </button>
        </div>
      </div>

      {/* Info side panel / modal */}
      {showInfo && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowInfo(false)} aria-hidden />

          {/* Panel: fixed to right, responsive width */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed top-0 right-0 h-screen w-full md:w-[35%] lg:w-[35%] bg-[#0F0F0F] shadow-lg neon-glow border md:rounded-l-2xl rounded-t-2xl slide-in-right"
            style={{ borderColor: 'rgba(0,255,132,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-weak)' }}>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-[linear-gradient(135deg,#00FF84,#008A45)] flex items-center justify-center font-semibold text-black text-lg">{contactName ? contactName[0] : "U"}</div>
                <div>
                  <div className="font-semibold text-lg">{contactName}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{phone}</div>
                </div>
              </div>
              <button onClick={() => setShowInfo(false)} className="p-2 rounded-md hover:bg-[var(--hover-neon)]" aria-label="Fechar painel">
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-4">
              <div className="h-px bg-[rgba(255,255,255,0.03)] mb-3" />
              <div className="text-sm text-[var(--text-secondary)]">Salvo por: <span className="text-[var(--text-primary)] font-semibold">{savedBy}</span></div>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
