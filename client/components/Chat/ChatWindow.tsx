import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  sender: "user" | "bot" | "agent";
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
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/60 bg-background/60 backdrop-blur rounded-t-xl">
        <div className="font-medium">{contactName}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{status || "online"}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background/40 to-background/20">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.sender === "user" ? "justify-end" : "justify-start")}> 
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-md",
                m.sender === "user" && "bg-primary text-[rgb(10,15,13)]",
                m.sender !== "user" && "bg-sidebar-accent/70 border border-border/60",
              )}
            >
              <div>{m.text}</div>
              <div className={cn("text-[10px] mt-1", m.sender === "user" ? "text-[rgb(10,15,13)]/70" : "text-muted-foreground")}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
