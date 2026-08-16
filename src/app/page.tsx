import Link from "next/link";
import { CalendarHeart, Megaphone, Pin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isPollClosed } from "@/lib/polls";
import { TopBar } from "@/components/TopBar";
import { PollCard } from "@/components/PollCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { GhostButton } from "@/components/ui/Buttons";

export default async function HomePage() {
  const [polls, notices] = await Promise.all([
    prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: { options: { include: { votes: true } } },
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  const activePolls = polls.filter((p) => !isPollClosed(p));
  const closedPolls = polls.filter((p) => isPollClosed(p));

  return (
    <div className="animate-fade-in">
      <TopBar />

      <div className="px-5 pb-2 pt-1">
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-purple text-primary">
          <CalendarHeart size={24} strokeWidth={1.75} />
        </div>
        <h1 className="mt-3 text-[22px] font-bold leading-tight tracking-tight text-text-primary">
          이번 모임, 다 같이
          <br />
          정해봐요
        </h1>
        <p className="mt-1.5 text-[15px] text-text-secondary">
          시간과 게임을 투표로 정하고, 공지도 한곳에서 확인하세요.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-8 px-5">
        <section>
          <SectionTitle>진행 중인 투표</SectionTitle>
          {activePolls.length === 0 ? (
            <EmptyState
              icon={CalendarHeart}
              title="진행 중인 투표가 없어요"
              description="관리자가 새 투표를 만들면 여기에 표시됩니다."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activePolls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                return (
                  <li key={poll.id}>
                    <PollCard
                      id={poll.id}
                      type={poll.type}
                      title={poll.title}
                      totalVotes={totalVotes}
                      deadline={poll.deadline}
                      closed={false}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle
            action={
              <GhostButton href="/notice">
                더보기
                <ChevronRight size={14} />
              </GhostButton>
            }
          >
            최근 공지
          </SectionTitle>
          {notices.length === 0 ? (
            <EmptyState icon={Megaphone} title="등록된 공지가 없어요" />
          ) : (
            <ul className="flex flex-col gap-2">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href="/notice"
                    className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-medium text-text-primary transition active:scale-[0.98]"
                  >
                    {notice.isPinned && <Pin size={14} className="shrink-0 text-primary" />}
                    <span className="truncate">{notice.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {closedPolls.length > 0 && (
          <section>
            <SectionTitle>마감된 투표</SectionTitle>
            <ul className="flex flex-col gap-2.5">
              {closedPolls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                return (
                  <li key={poll.id}>
                    <PollCard
                      id={poll.id}
                      type={poll.type}
                      title={poll.title}
                      totalVotes={totalVotes}
                      deadline={poll.deadline}
                      closed
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
