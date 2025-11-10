import { cn } from "@/lib/utils";

interface Props {
  name: string;
  lastMessage: string;
  time: string;
  active?: boolean;
  unread?: number;
  status?: string;
  onClick?: () => void;
}

export default function ContactListItem({
  name,
  lastMessage,
  time,
  active,
  unread,
  status,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      title={`${name}: ${lastMessage}`}
      aria-label={`${name}, ${status ?? "offline"}, última mensagem: ${lastMessage}`}
            className={cn(
        "w-full text-left px-3 py-3 rounded-[16px] border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 contact-card",
        active
          ? "bg-[rgba(0,255,132,0.06)] border-[var(--border-weak)]"
          : "hover:bg-[var(--hover-neon)] border-transparent",
      )}
    >
      <div className="flex gap-3 items-center">
        <div className="h-12 w-12 rounded-full bg-[linear-gradient(135deg,#00FF84,#008A45)] shrink-0 shadow-[0_6px_18px_rgba(0,255,132,0.08)] flex items-center justify-center text-black font-semibold text-sm">{(name && name[0]) ?? "C"}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold truncate">{name}</div>
            {status && (
              <span className="text-[11px] text-[var(--text-secondary)] ml-2">{status}</span>
            )}
            <div className="ml-auto text-[12px] text-[var(--text-secondary)]">{time}</div>
          </div>
          <div className="text-sm text-[var(--text-secondary)] truncate mt-1">{lastMessage}</div>
        </div>
        {unread ? (
          <span className="ml-2 text-[12px] px-2 py-0.5 rounded-full bg-[rgba(0,255,132,0.08)] text-[var(--neon-green)] shadow-[0_0_12px_rgba(0,255,132,0.08)]">{unread}</span>
        ) : null}
      </div>
    </button>
  );
}
