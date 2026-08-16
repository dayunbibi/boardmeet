import Link from "next/link";
import { Dices, Megaphone, Settings } from "lucide-react";

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/85 px-5 py-4 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
          <Dices size={17} strokeWidth={2} />
        </span>
        <span className="text-[15px] font-bold tracking-tight text-text-primary">
          보드게임 동아리
        </span>
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/notice"
          aria-label="공지사항"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
        >
          <Megaphone size={19} strokeWidth={1.75} />
        </Link>
        <Link
          href="/admin"
          aria-label="관리자"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
        >
          <Settings size={19} strokeWidth={1.75} />
        </Link>
      </nav>
    </div>
  );
}
