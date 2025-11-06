import { useEffect, useRef } from "react";
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
        </div>
        {typeof onSend === "function" && (
          <div>
            <Button size="sm" className="btn-neon" onClick={onSend}>
              <Send className="h-3 w-3" /> Enviar
            </Button>
          </div>
        )}
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
