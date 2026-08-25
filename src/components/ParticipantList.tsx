import { Accordion } from "@/components/ui/Accordion";
import type { Participant } from "@/lib/polls";
import type { Locale } from "@/lib/i18n";

export function ParticipantList({ participants, locale = "ko" }: { participants: Participant[]; locale?: Locale }) {
  if (participants.length === 0) {
    return <p className="text-sm text-text-secondary">{locale === "ko" ? "아직 참여자가 없습니다." : "No participants yet."}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {participants.map((p) => (
        <Accordion
          key={p.key}
          summary={
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-text-primary">{p.name}</span>
              <span className="text-[13px] text-text-secondary">
                {locale === "ko" ? `${p.optionLabels.length}개 선택` : `${p.optionLabels.length} selected`}
              </span>
            </div>
          }
        >
          <ul className="flex flex-col gap-1.5">
            {p.optionLabels.map((label, i) => (
              <li key={i} className="text-sm text-text-secondary">
                • {label}
              </li>
            ))}
          </ul>
        </Accordion>
      ))}
    </div>
  );
}
