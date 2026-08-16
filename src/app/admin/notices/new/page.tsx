import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/Buttons";
import { createNoticeAction } from "../../actions";

export default async function NewNoticePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="animate-fade-in">
      <PageHeader title="새 공지 작성" backHref="/admin" />

      <div className="px-5">
        {error && (
          <div className="mb-4 rounded-2xl bg-warning px-4 py-3 text-[14px] text-warning-text">
            {error}
          </div>
        )}

        <form action={createNoticeAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-[13px] font-medium text-text-secondary">
              제목
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
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
              className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3.5 text-[14px] font-medium text-text-primary">
            <input type="checkbox" name="isPinned" className="h-4 w-4 accent-primary" />
            상단 고정
          </label>

          <PrimaryButton type="submit">공지 등록</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
