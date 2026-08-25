"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const nextLocale = locale === "ko" ? "en" : "ko";
  const label = locale === "ko" ? "English" : "한국어";

  function switchLanguage() {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      className="fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-lg transition hover:bg-soft-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95"
    >
      <Languages size={17} aria-hidden="true" />
      {label}
    </button>
  );
}
