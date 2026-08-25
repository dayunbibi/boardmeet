"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function ShareButton({ path, label, locale = "ko" }: { path: string; label?: string; locale?: Locale }) {
  const [copied, setCopied] = useState(false);
  const shareLabel = label ?? (locale === "ko" ? "공유" : "Share");

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt(locale === "ko" ? "아래 링크를 복사하세요" : "Copy the link below", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-primary transition active:scale-95"
    >
      {copied ? (
        <>
          <Check size={15} className="text-success-text" />
          {locale === "ko" ? "복사됨" : "Copied"}
        </>
      ) : (
        <>
          <Share2 size={15} />
          {shareLabel}
        </>
      )}
    </button>
  );
}
