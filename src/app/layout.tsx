import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "보드게임 동아리",
  description: "모임 시간 투표, 보드게임 투표, 공지를 한 곳에서",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell>
          <main className="flex-1 pb-10">{children}</main>
        </AppShell>
      </body>
    </html>
  );
}
