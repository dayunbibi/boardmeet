import { Check } from "lucide-react";

export function VoteOptionCard({
  type,
  name,
  value,
  label,
  defaultChecked,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 transition has-checked:border-primary has-checked:bg-soft-purple active:scale-[0.98]">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="flex-1 text-[15px] font-medium text-text-primary">{label}</span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border text-transparent transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
        <Check size={13} strokeWidth={3} />
      </span>
    </label>
  );
}
