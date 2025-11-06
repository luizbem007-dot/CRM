import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export interface Message {
  id: string;
  sender: "user" | "bot" | "agent";
  text: string;
  time: string;
}

interface ConversationMeta {
  id?: string;
  phone?: string;
  name?: string;
  bot_enabled?: boolean;
  assigned_to?: string | null;
  tags?: string[];
  status?: string;
}

interface ChatWindowProps {
  messages: Message[];
  contactName: string;
  status?: string;
  onSend?: () => void;
  conversation?: ConversationMeta;
  onToggleBot?: (enabled: boolean) => void;
  onAssign?: () => void;
  onRelease?: () => void;
  onSaveContact?: () => void;
  onAddNote?: () => void;
  onUpdateTags?: (tags: string[]) => void;
  onSetStatus?: (status: string) => void;
}

export default function ChatWindow({
  messages,
  contactName,
  status,
  conversation,
  onToggleBot,
  onAssign,
  onRelease,
  onSaveContact,
  onAddNote,
  onUpdateTags,
  onSetStatus,
  onSend,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full chat-panel rounded-t-xl panel-border-neon">
      <div className="px-4 py-3 border-b border-border/60 bg-background/60 backdrop-blur rounded-t-xl flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-white">{contactName}</div>
          <div className="text-xs text-text-secondary mt-0.5">{status || "online"}</div>
          {conversation?.assigned_to && (
            <div className="text-[11px] text-text-secondary mt-1">👤 {conversation.assigned_to} assumiu esta conversa</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bot toggle */}
          {typeof onToggleBot === 'function' && (
            <button
              onClick={() => onToggleBot(!conversation?.bot_enabled)}
              className={"px-3 py-1 rounded-full text-sm " + (conversation?.bot_enabled ? 'bg-[#062e1f] text-[#00ff99]' : 'bg-[#1b1b1b] text-text-secondary')}
            >
              {conversation?.bot_enabled ? '🤖 Bot Ativo' : '🧍 Modo Manual'}
            </button>
          )}

          {/* Assign / Release */}
          {typeof onAssign === 'function' && typeof onRelease === 'function' && (
            conversation?.assigned_to ? (
              <button onClick={onRelease} className="px-3 py-1 rounded-md text-sm bg-gray-800">Liberar</button>
            ) : (
              <button onClick={onAssign} className="px-3 py-1 rounded-md text-sm btn-neon">Assumir</button>
            )
          )}

          {/* Save contact */}
          {typeof onSaveContact === 'function' && (
            <button onClick={onSaveContact} className="px-2 py-1 rounded-md text-sm bg-background/30 border">💾 Salvar</button>
          )}

          {/* Notes */}
          {typeof onAddNote === 'function' && (
            <button onClick={onAddNote} className="px-2 py-1 rounded-md text-sm bg-background/30 border">🗒 Notas</button>
          )}

          {/* Send */}
          {typeof onSend === "function" && (
            <Button size="sm" className="btn-neon" onClick={onSend}>
              <Send className="h-3 w-3" /> Enviar
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.sender === "user" ? "justify-end" : "justify-start") + " message-fade"}>
            <div className={cn("max-w-[75%] px-3 py-2 text-sm", m.sender === "user" ? "bubble-sent" : "bubble-recv") }>
              <div>{m.text}</div>
              <div className={cn("text-[10px] mt-1", m.sender === "user" ? "text-[rgba(0,0,0,0.6)]" : "text-text-secondary")}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
