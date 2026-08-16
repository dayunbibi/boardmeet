import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { PollWizard } from "./PollWizard";

export default async function NewPollPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="animate-fade-in">
      <PageHeader title="새 투표 만들기" backHref="/admin" />
      <div className="px-5">
        <PollWizard initialError={error} />
      </div>
    </div>
  );
}
