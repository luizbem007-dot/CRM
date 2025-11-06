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
      className={cn(
        "w-full text-left px-3 py-3 rounded-xl border border-transparent transition-all",
        active
          ? "bg-[#07120e] border-primary/30 neon-glow"
          : "hover:bg-[#08110f]/60 hover:neon-glow",
      )}
    >
      <div className="flex gap-3 items-center">
        <div className="h-10 w-10 rounded-full bg-[linear-gradient(135deg,#00FF66,#008A45)] shrink-0 shadow-[0_0_18px_rgba(0,255,102,0.12)] flex items-center justify-center text-black font-bold">{name[0] ?? "C"}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{name}</div>
            {status && (
              <span className="text-[10px] text-text-secondary">
                {status}
              </span>
            )}
            <div className="ml-auto text-[11px] text-text-secondary">
              {time}
            </div>
          </div>
          <div className="text-xs text-text-secondary truncate">
            {lastMessage}
          </div>
        </div>
        {unread ? (
          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-[#00FF66]/20 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.08)]">
            {unread}
          </span>
        ) : null}
      </div>
    </button>
  );
}
