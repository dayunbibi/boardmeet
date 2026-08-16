import { Accordion } from "@/components/ui/Accordion";
import type { Participant } from "@/lib/polls";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return <p className="text-sm text-text-secondary">아직 참여자가 없습니다.</p>;
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
                {p.optionLabels.length}개 선택
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
