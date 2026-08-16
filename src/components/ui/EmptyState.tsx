import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-soft-purple text-primary">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  );
}
