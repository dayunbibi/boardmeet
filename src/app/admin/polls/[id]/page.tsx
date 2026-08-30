import { notFound } from "next/navigation";
import { Trophy, Gamepad2, Users, RotateCcw, Lock, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPollClosed, getOptionResults, getParticipants, getParticipantCount } from "@/lib/polls";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareButton } from "@/components/ui/ShareButton";
import { Badge } from "@/components/ui/Badge";
import { GhostButton } from "@/components/ui/Buttons";
import { RankRow } from "@/components/ui/RankRow";
import { HighlightCard } from "@/components/ui/HighlightCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ParticipantList } from "@/components/ParticipantList";
import { closePollAction, reopenPollAction, deletePollAction } from "../../actions";

export default async function AdminPollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      participants: true,
      options: { orderBy: { order: "asc" }, include: { votes: true } },
    },
  });
  if (!poll) notFound();

  const closed = isPollClosed(poll);
  const isTimePoll = poll.type === "TIME";
  let results = getOptionResults(poll);
  if (!isTimePoll) {
    results = [...results].sort((a, b) => b.count - a.count);
  }
  const totalParticipants = getParticipantCount(poll);
  const winner = results.find((r) => r.isWinner && r.count > 0);
  const participants = getParticipants(poll);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={poll.title}
        backHref="/admin"
        action={<ShareButton path={`/poll/${poll.id}`} label="참여 링크" />}
      />

      <div className="flex flex-col gap-6 px-5">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="purple">{isTimePoll ? "모임 시간 투표" : "보드게임 투표"}</Badge>
            <Badge tone={closed ? "neutral" : "success"}>{closed ? "마감" : "진행중"}</Badge>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-text-secondary">
            {poll.deadline && <span>마감 {formatDateTime(poll.deadline)}</span>}
            <span className="flex items-center gap-1">
              <Users size={13} />
              {totalParticipants}명 참여
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {closed ? (
            <form action={reopenPollAction.bind(null, poll.id)}>
              <GhostButton type="submit" className="border border-border">
                <RotateCcw size={14} />
                재개
              </GhostButton>
            </form>
          ) : (
            <form action={closePollAction.bind(null, poll.id)}>
              <GhostButton type="submit" className="border border-border">
                <Lock size={14} />
                지금 마감
              </GhostButton>
            </form>
          )}
          <form action={deletePollAction.bind(null, poll.id)}>
            <GhostButton type="submit" className="border border-red-200 text-red-500">
              <Trash2 size={14} />
              삭제
            </GhostButton>
          </form>
        </div>

        {winner && (
          <HighlightCard
            icon={isTimePoll ? Trophy : Gamepad2}
            eyebrow={isTimePoll ? "베스트 시간" : "인기 게임 1위"}
            label={winner.label}
            meta={`${winner.count}명이 선택했어요`}
          />
        )}

        <section>
          <SectionTitle>{isTimePoll ? "시간별 결과" : "게임 순위"}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {results.map((r, i) => (
              <RankRow
                key={r.id}
                rank={i + 1}
                label={r.label}
                count={r.count}
                total={totalParticipants}
                percentage={r.percentage}
                highlighted={r.isWinner && r.count > 0}
                voterNames={r.voterNames}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>참여자 ({participants.length})</SectionTitle>
          <ParticipantList participants={participants} />
        </section>
      </div>
    </div>
  );
}
