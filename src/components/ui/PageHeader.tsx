import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getLocale, getMessages } from "@/lib/i18n";

export async function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  const t = getMessages(await getLocale());
  return (
    <div className="flex items-center gap-2 px-5 pb-2 pt-5">
      {backHref && (
        <Link
          href={backHref}
          aria-label={t.back}
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-primary transition active:scale-90 active:bg-soft-purple"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>
      )}
      <h1 className="flex-1 truncate text-[17px] font-bold tracking-tight text-text-primary">
        {title}
      </h1>
      {action}
    </div>
  );
}
