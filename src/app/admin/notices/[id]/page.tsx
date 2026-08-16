import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { updateNoticeAction, deleteNoticeAction } from "../../actions";

export default async function EditNoticePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  return (
    <div className="animate-fade-in">
      <PageHeader title="공지 수정" backHref="/admin" />

      <div className="px-5">
        {error && (
          <div className="mb-4 rounded-2xl bg-warning px-4 py-3 text-[14px] text-warning-text">
            {error}
          </div>
        )}

        <form action={updateNoticeAction.bind(null, notice.id)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-[13px] font-medium text-text-secondary">
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={notice.title}
              className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="body" className="text-[13px] font-medium text-text-secondary">
              내용
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={6}
              defaultValue={notice.body}
              className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3.5 text-[14px] font-medium text-text-primary">
            <input
              type="checkbox"
              name="isPinned"
              defaultChecked={notice.isPinned}
              className="h-4 w-4 accent-primary"
            />
            상단 고정
          </label>

          <PrimaryButton type="submit">저장</PrimaryButton>
        </form>

        <form action={deleteNoticeAction.bind(null, notice.id)} className="mt-3">
          <GhostButton type="submit" className="w-full justify-center border border-red-200 text-red-500">
            <Trash2 size={14} />
            공지 삭제
          </GhostButton>
        </form>
      </div>
    </div>
  );
}
