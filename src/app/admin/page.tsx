import Link from "next/link";
import { KeyRound, ListChecks, Megaphone, Plus, LogOut, Pin } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPollClosed } from "@/lib/polls";
import { formatDateTime } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
  loginAction,
  logoutAction,
  closePollAction,
  reopenPollAction,
  deletePollAction,
  deleteNoticeAction,
} from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="animate-fade-in px-5 pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-purple text-primary">
            <KeyRound size={26} strokeWidth={1.75} />
          </div>
          <h1 className="mt-4 text-[20px] font-bold tracking-tight text-text-primary">
            관리자 로그인
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">PIN을 입력해 관리자 페이지로 이동하세요.</p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-warning px-4 py-3 text-center text-[14px] text-warning-text">
            {error}
          </div>
        )}

        <form action={loginAction} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            name="pin"
            required
            inputMode="numeric"
            placeholder="관리자 PIN"
            autoFocus
            className="rounded-xl border border-border bg-surface px-4 py-3.5 text-center text-[18px] tracking-[0.3em] text-text-primary outline-none focus:border-primary"
          />
          <PrimaryButton type="submit">로그인</PrimaryButton>
        </form>
      </div>
    );
  }

  const [polls, notices] = await Promise.all([
    prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: { options: { include: { votes: true } } },
    }),
    prisma.notice.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="animate-fade-in">
      <TopBar />

      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <h1 className="text-[20px] font-bold tracking-tight text-text-primary">관리자</h1>
        <form action={logoutAction}>
          <GhostButton type="submit">
            <LogOut size={14} />
            로그아웃
          </GhostButton>
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-8 px-5">
        <section>
          <SectionTitle
            action={
              <PrimaryButton href="/admin/polls/new" className="px-4 py-2 text-[13px]">
                <Plus size={15} />
                새 투표
              </PrimaryButton>
            }
          >
            투표 관리
          </SectionTitle>
          {polls.length === 0 ? (
            <EmptyState icon={ListChecks} title="생성된 투표가 없어요" />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {polls.map((poll) => {
                const closed = isPollClosed(poll);
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                return (
                  <li
                    key={poll.id}
                    className="rounded-2xl border border-border bg-surface px-4 py-3.5"
                  >
                    <Link href={`/admin/polls/${poll.id}`} className="block">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Badge tone={closed ? "neutral" : "success"}>
                          {closed ? "마감" : "진행중"}
                        </Badge>
                        <span className="text-[13px] text-text-secondary">{totalVotes}표</span>
                      </div>
                      <p className="truncate text-[15px] font-semibold text-text-primary">
                        {poll.title}
                      </p>
                    </Link>
                    <div className="mt-2.5 flex gap-3 border-t border-border pt-2.5">
                      {closed ? (
                        <form action={reopenPollAction.bind(null, poll.id)}>
                          <button className="text-[13px] font-medium text-primary">재개</button>
                        </form>
                      ) : (
                        <form action={closePollAction.bind(null, poll.id)}>
                          <button className="text-[13px] font-medium text-text-secondary">
                            마감
                          </button>
                        </form>
                      )}
                      <form action={deletePollAction.bind(null, poll.id)}>
                        <button className="text-[13px] font-medium text-red-500">삭제</button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle
            action={
              <PrimaryButton href="/admin/notices/new" className="px-4 py-2 text-[13px]">
                <Plus size={15} />
                새 공지
              </PrimaryButton>
            }
          >
            공지 관리
          </SectionTitle>
          {notices.length === 0 ? (
            <EmptyState icon={Megaphone} title="등록된 공지가 없어요" />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3.5"
                >
                  <Link href={`/admin/notices/${notice.id}`} className="block">
                    <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-text-primary">
                      {notice.isPinned && <Pin size={13} className="shrink-0 text-primary" />}
                      {notice.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-text-secondary">
                      {formatDateTime(notice.createdAt)}
                    </p>
                  </Link>
                  <div className="mt-2.5 border-t border-border pt-2.5">
                    <form action={deleteNoticeAction.bind(null, notice.id)}>
                      <button className="text-[13px] font-medium text-red-500">삭제</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
