import React, { useEffect, useRef } from "react";

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full rounded-t-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-background/60 backdrop-blur rounded-t-xl">
        <div className="font-medium text-white">{contactName}</div>
        <div className="text-xs text-text-secondary mt-0.5">{status || "online"}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ background: "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,255,102,0.04) 100%)" }}>
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={m.sender === "agent" ? "flex justify-end" : "flex justify-start"}>
              <div style={{ maxWidth: '75%' }} className={m.sender === "agent" ? "bg-[#00FF66]/10 text-white px-3 py-2 rounded-xl" : "bg-[#0b0b0b] text-text-secondary px-3 py-2 rounded-xl"}>
                <div>{m.text}</div>
                <div className="text-[10px] mt-1 text-text-secondary">{m.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
