"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ path, label = "공유" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("아래 링크를 복사하세요", url);
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
          복사됨
        </>
      ) : (
        <>
          <Share2 size={15} />
          {label}
        </>
      )}
    </button>
  );
}
