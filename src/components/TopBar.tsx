import Link from "next/link";
import { Dices, Megaphone, Settings } from "lucide-react";
import { getLocale, getMessages } from "@/lib/i18n";

export async function TopBar() {
  const t = getMessages(await getLocale());
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/85 px-5 py-4 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
          <Dices size={17} strokeWidth={2} />
        </span>
        <span className="text-[15px] font-bold tracking-tight text-text-primary">
          {t.clubName}
        </span>
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/notice"
          aria-label={t.notices}
          className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
        >
          <Megaphone size={19} strokeWidth={1.75} />
        </Link>
        <Link
          href="/admin"
          aria-label={t.admin}
          className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
        >
          <Settings size={19} strokeWidth={1.75} />
        </Link>
      </nav>
    </div>
  );
}
