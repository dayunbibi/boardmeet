import Link from "next/link";
import { CalendarDays, Dices, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";

export function PollCard({
  id,
  type,
  title,
  totalVotes,
  deadline,
  closed,
}: {
  id: string;
  type: "TIME" | "GAME";
  title: string;
  totalVotes: number;
  deadline: Date | null;
  closed: boolean;
}) {
  const Icon = type === "TIME" ? CalendarDays : Dices;

  return (
    <Link
      href={`/poll/${id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 transition active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft-purple text-primary">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <Badge tone={closed ? "neutral" : "success"}>{closed ? "마감" : "진행중"}</Badge>
        </div>
        <p className="truncate text-[15px] font-semibold text-text-primary">{title}</p>
        <p className="truncate text-[13px] text-text-secondary">
          참여 {totalVotes}표{deadline && ` · 마감 ${formatDateTime(deadline)}`}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-text-secondary/60" />
    </Link>
  );
}
