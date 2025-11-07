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
        "w-full text-left px-3 py-3 rounded-xl border border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-offset-1",
        active
          ? "bg-[#07120e] border-primary/30 neon-glow"
          : "hover:bg-[#08110f]/60 hover:neon-glow",
      )}
    >
      <div className="flex gap-3 items-center">
        <div className="h-12 w-12 rounded-full bg-[linear-gradient(135deg,#00FF66,#008A45)] shrink-0 shadow-[0_0_18px_rgba(0,255,102,0.12)] flex items-center justify-center text-black font-bold text-sm">{(name && name[0]) ?? "C"}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{name}</div>
            {status && (
              <span className="text-[11px] text-text-secondary ml-2">
                {status}
              </span>
            )}
            <div className="ml-auto text-[12px] text-text-secondary">
              {time}
            </div>
          </div>
          <div className="text-sm text-text-secondary truncate mt-1">
            {lastMessage}
          </div>
        </div>
        {unread ? (
          <span className="ml-2 text-[12px] px-2 py-0.5 rounded-full bg-[#00FF66]/12 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.08)]">
            {unread}
          </span>
        ) : null}
      </div>
    </button>
  );
}
