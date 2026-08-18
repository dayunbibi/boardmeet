export function AttendanceToggle({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 transition active:scale-[0.98]">
      <span className="text-[15px] font-medium text-text-primary">{label}</span>
      <span className="relative inline-flex items-center rounded-full bg-black/[0.05] p-1">
        <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-text-secondary transition peer-checked:bg-primary peer-checked:text-white">
          참석
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-text-primary shadow-sm transition peer-checked:bg-transparent peer-checked:text-text-secondary peer-checked:shadow-none">
          불참
        </span>
      </span>
    </label>
  );
}
