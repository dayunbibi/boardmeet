import { Pin, Megaphone } from "lucide-react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShareButton } from "@/components/ui/ShareButton";

export default async function NoticePage() {
  await connection();

  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="공지사항"
        backHref="/"
        action={<ShareButton path="/notice" label="공유" />}
      />

      <div className="px-5">
        {notices.length === 0 ? (
          <EmptyState icon={Megaphone} title="등록된 공지가 없어요" />
        ) : (
          <ul className="flex flex-col gap-3">
            {notices.map((notice) => (
              <li
                key={notice.id}
                className={`rounded-2xl border px-4 py-4 ${
                  notice.isPinned ? "border-primary/20 bg-soft-purple" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {notice.isPinned && <Pin size={14} className="text-primary" />}
                  <h2 className="text-[15px] font-bold text-text-primary">{notice.title}</h2>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
                  {notice.body}
                </p>
                <p className="mt-2.5 text-[12px] text-text-secondary/70">
                  {formatDateTime(notice.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
