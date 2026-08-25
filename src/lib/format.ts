import type { Locale } from "@/lib/i18n";

export function formatDateTime(date: Date | null | undefined, locale: Locale = "ko"): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date | null | undefined, locale: Locale = "ko"): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
