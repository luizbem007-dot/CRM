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
        "w-full text-left px-3 py-3 rounded-xl border border-transparent",
        active
          ? "bg-primary/10 border-primary/30"
          : "hover:bg-sidebar-accent/70",
      )}
    >
      <div className="flex gap-3 items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{name}</div>
            {status && (
              <span className="text-[10px] text-muted-foreground">
                {status}
              </span>
            )}
            <div className="ml-auto text-[11px] text-muted-foreground">
              {time}
            </div>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {lastMessage}
          </div>
        </div>
        {unread ? (
          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-primary/30 text-primary">
            {unread}
          </span>
        ) : null}
      </div>
    </button>
  );
}
