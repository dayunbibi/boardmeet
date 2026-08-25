import Link from "next/link";
import { connection } from "next/server";
import { CalendarHeart, Megaphone, Pin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isPollClosed } from "@/lib/polls";
import { TopBar } from "@/components/TopBar";
import { PollCard } from "@/components/PollCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { GhostButton } from "@/components/ui/Buttons";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function HomePage() {
  await connection();
  const locale = await getLocale();
  const t = getMessages(locale);

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
          {t.heroTitle.split("\n").map((line, index) => (
            <span key={line}>{index > 0 && <br />}{line}</span>
          ))}
        </h1>
        <p className="mt-1.5 text-[15px] text-text-secondary">
          {t.heroDescription}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-8 px-5">
        <section>
          <SectionTitle>{t.activePolls}</SectionTitle>
          {activePolls.length === 0 ? (
            <EmptyState
              icon={CalendarHeart}
              title={t.noActivePolls}
              description={t.noActivePollsDescription}
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
                      locale={locale}
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
                {t.more}
                <ChevronRight size={14} />
              </GhostButton>
            }
          >
            {t.recentNotices}
          </SectionTitle>
          {notices.length === 0 ? (
            <EmptyState icon={Megaphone} title={t.noNotices} />
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
            <SectionTitle>{t.closedPolls}</SectionTitle>
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
                      locale={locale}
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
