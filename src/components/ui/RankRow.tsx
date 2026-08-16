export function RankRow({
  rank,
  label,
  count,
  total,
  percentage,
  highlighted,
  voterNames,
}: {
  rank?: number;
  label: string;
  count: number;
  total: number;
  percentage: number;
  highlighted?: boolean;
  voterNames?: string[];
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        highlighted ? "border-primary/30 bg-soft-purple" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center gap-3">
        {rank !== undefined && (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
              highlighted ? "bg-primary text-white" : "bg-black/[0.05] text-text-secondary"
            }`}
          >
            {rank}
          </span>
        )}
        <span className="flex-1 truncate text-[15px] font-semibold text-text-primary">
          {label}
        </span>
        <span className="shrink-0 text-sm font-medium text-text-secondary">
          {count} / {total}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${highlighted ? "bg-primary" : "bg-primary/50"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {voterNames && voterNames.length > 0 && (
        <p className="mt-2 truncate text-[13px] text-text-secondary">{voterNames.join(", ")}</p>
      )}
    </div>
  );
}
