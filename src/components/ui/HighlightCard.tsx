import type { LucideIcon } from "lucide-react";

export function HighlightCard({
  icon: Icon,
  eyebrow,
  label,
  meta,
}: {
  icon: LucideIcon;
  eyebrow: string;
  label: string;
  meta: string;
}) {
  return (
    <div className="rounded-2xl bg-primary px-5 py-5 text-white">
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/75">
        <Icon size={15} strokeWidth={2} />
        {eyebrow}
      </div>
      <p className="mt-1.5 text-[19px] font-bold leading-snug tracking-tight">{label}</p>
      <p className="mt-0.5 text-[13px] text-white/75">{meta}</p>
    </div>
  );
}
