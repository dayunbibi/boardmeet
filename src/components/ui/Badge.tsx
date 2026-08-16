type Tone = "purple" | "success" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  purple: "bg-soft-purple text-primary",
  success: "bg-success text-success-text",
  warning: "bg-warning text-warning-text",
  neutral: "bg-black/[0.05] text-text-secondary",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
