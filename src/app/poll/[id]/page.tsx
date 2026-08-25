import { notFound } from "next/navigation";
import { Trophy, Gamepad2, Users, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDeviceId } from "@/lib/device";
import { isPollClosed, getOptionResults, getParticipants, getParticipantCount } from "@/lib/polls";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareButton } from "@/components/ui/ShareButton";
import { Badge } from "@/components/ui/Badge";
import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { VoteOptionCard } from "@/components/ui/VoteOptionCard";
import { AttendanceToggle } from "@/components/ui/AttendanceToggle";
import { RankRow } from "@/components/ui/RankRow";
import { HighlightCard } from "@/components/ui/HighlightCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ParticipantList } from "@/components/ParticipantList";
import { submitVoteAction, cancelVoteAction } from "./actions";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function PollPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const locale = await getLocale();
  const t = getMessages(locale);

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: { orderBy: { order: "asc" }, include: { votes: true } } },
  });

  if (!poll) notFound();

  const closed = isPollClosed(poll);
  const deviceId = await getDeviceId();
  const myOptionIds = deviceId
    ? new Set(
        poll.options
          .filter((o) => o.votes.some((v) => v.deviceToken === deviceId))
          .map((o) => o.id)
      )
    : new Set<string>();
  const myVoterName = deviceId
    ? poll.options.flatMap((o) => o.votes).find((v) => v.deviceToken === deviceId)?.voterName ?? ""
    : "";
  const hasVoted = myOptionIds.size > 0;

  const isTimePoll = poll.type === "TIME";
  const inputType = isTimePoll ? "checkbox" : "radio";

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
        backHref="/"
        action={<ShareButton path={`/poll/${poll.id}`} locale={locale} />}
      />

      <div className="flex flex-col gap-6 px-5">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="purple">{isTimePoll ? t.timePoll : t.gamePoll}</Badge>
            <Badge tone={closed ? "neutral" : "success"}>{closed ? t.closed : t.open}</Badge>
          </div>
          {poll.description && (
            <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
              {poll.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-[13px] text-text-secondary">
            {poll.deadline && <span>{t.deadline} {formatDateTime(poll.deadline, locale)}</span>}
            <span className="flex items-center gap-1">
              <Users size={13} />
              {totalParticipants}{t.participants}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-warning px-4 py-3 text-[14px] text-warning-text">
            {error}
          </div>
        )}

        {closed && winner && (
          <HighlightCard
            icon={isTimePoll ? Trophy : Gamepad2}
            eyebrow={isTimePoll ? t.bestTime : t.topGame}
            label={winner.label}
            meta={`${winner.count}${t.selectedBy}`}
          />
        )}

        {!closed && (
          <form
            action={submitVoteAction.bind(null, poll.id)}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <p className="text-[15px] font-bold text-text-primary">
              {hasVoted ? t.editVote : t.vote}
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="voterName" className="text-[13px] font-medium text-text-secondary">
                {t.name}
              </label>
              <input
                id="voterName"
                name="voterName"
                type="text"
                required
                maxLength={20}
                defaultValue={myVoterName}
                placeholder={t.namePlaceholder}
                className="rounded-xl border border-border bg-bg px-4 py-3 text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-text-secondary">
                {isTimePoll ? t.chooseAttendance : t.chooseGame}
              </span>
              {poll.options.map((option) =>
                isTimePoll ? (
                  <AttendanceToggle
                    key={option.id}
                    name="optionIds"
                    value={option.id}
                    label={option.label}
                    defaultChecked={myOptionIds.has(option.id)}
                    attendingLabel={t.attending}
                    notAttendingLabel={t.notAttending}
                  />
                ) : (
                  <VoteOptionCard
                    key={option.id}
                    type={inputType}
                    name="optionIds"
                    value={option.id}
                    label={option.label}
                    defaultChecked={myOptionIds.has(option.id)}
                  />
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              <PrimaryButton type="submit" className="flex-1">
                {hasVoted ? t.update : t.submit}
              </PrimaryButton>
              {hasVoted && (
                <GhostButton formAction={cancelVoteAction.bind(null, poll.id)}>
                  <X size={14} />
                  {t.cancel}
                </GhostButton>
              )}
            </div>
          </form>
        )}

        <section>
          <SectionTitle>{isTimePoll ? t.timeResults : t.gameRanking}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {results.map((r, i) => (
              <RankRow
                key={r.id}
                rank={i + 1}
                label={r.label}
                count={r.count}
                total={totalParticipants}
                percentage={r.percentage}
                highlighted={closed && r.isWinner && r.count > 0}
                voterNames={r.voterNames}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>{t.participantList} ({participants.length})</SectionTitle>
          <ParticipantList participants={participants} locale={locale} />
        </section>
      </div>
    </div>
  );
}
