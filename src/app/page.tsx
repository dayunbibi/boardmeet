"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "ko">("en");

  const isKorean = language === "ko";

  return (
    <main className="min-h-screen bg-[#F4F0FF]">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#FCFBF7] px-5 pb-10 pt-5 text-[#0B1C30] shadow-xl">
        {/* 오른쪽 위 배경 주사위 */}
       <div
  className="pointer-events-none absolute -right-14 top-20 z-0"
  aria-hidden="true"
>
  <svg
    width="170"
    height="170"
    viewBox="0 0 170 170"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="rotate-12"
  >
    <rect
      x="22"
      y="22"
      width="126"
      height="126"
      rx="28"
      fill="#E4D9FF"
    />

    <circle cx="58" cy="58" r="10" fill="#B9A2F8" />
    <circle cx="112" cy="58" r="10" fill="#B9A2F8" />
    <circle cx="85" cy="85" r="10" fill="#B9A2F8" />
    <circle cx="58" cy="112" r="10" fill="#B9A2F8" />
    <circle cx="112" cy="112" r="10" fill="#B9A2F8" />
  </svg>
</div>

        {/* 왼쪽 아래 배경 게임 아이콘 */}
       <div
  className="pointer-events-none absolute -bottom-10 -left-12 z-0"
  aria-hidden="true"
>
  <svg
    width="160"
    height="160"
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="-rotate-12"
  >
    <path
      d="M25 53C25 45.268 31.268 39 39 39H61C60.351 36.971 60 34.809 60 32.565C60 20.654 69.849 11 82 11C94.151 11 104 20.654 104 32.565C104 34.809 103.649 36.971 103 39H121C128.732 39 135 45.268 135 53V73C132.971 72.351 130.809 72 128.565 72C116.654 72 107 81.849 107 94C107 106.151 116.654 116 128.565 116C130.809 116 132.971 115.649 135 115V121C135 128.732 128.732 135 121 135H101C101.649 132.971 102 130.809 102 128.565C102 116.654 92.151 107 80 107C67.849 107 58 116.654 58 128.565C58 130.809 58.351 132.971 59 135H39C31.268 135 25 128.732 25 121V101C27.029 101.649 29.191 102 31.435 102C43.346 102 53 92.151 53 80C53 67.849 43.346 58 31.435 58C29.191 58 27.029 58.351 25 59V53Z"
      fill="#FFE9A8"
    />
  </svg>
</div>

        {/* 언어 버튼 */}
        <div className="absolute right-4 top-5 z-20">
          <button
            type="button"
            onClick={() =>
              setLanguage((current) => (current === "en" ? "ko" : "en"))
            }
            className="rounded-full border border-[#DDD8CF] bg-white px-3 py-1.5 text-xs font-semibold text-[#6D4AFF] shadow-sm"
          >
            {isKorean ? "EN" : "한국어"}
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center pt-12 text-center">
          {/* 메인 로고 */}
          <div className="mt-2 flex h-[90px] w-full items-center justify-center">
            <Image
              src="/boardmeet-logo-new.png"
              alt="BoardMeet"
              width={360}
              height={160}
              priority
              className="h-auto w-[260px] object-contain"
            />
          </div>

          {/* 메인 문구 */}
          <h1 className="mt-2 max-w-[340px] text-[22px] font-extrabold leading-[1.25] tracking-[-0.7px] text-[#0B1C30]">
            {isKorean ? (
              <>
                가장 좋은 날짜를 찾고,
                <br />
                함께 게임을 골라보세요.
              </>
            ) : (
              <>
                Find the best date,
                <br />
                then choose the game
                <br />
                together.
              </>
            )}
          </h1>

          {/* 설명 */}
          <p className="mt-4 max-w-[330px] text-[16px] leading-6 text-[#777782]">
            {isKorean
              ? "일정 조율부터 게임 투표까지, BoardMeet가 보드게임 모임 준비를 간단하게 만들어줘요."
              : "From coordinating schedules to voting for a game, BoardMeet keeps your game night planning simple."}
          </p>

          {/* 버튼 */}
          <div className="mt-10 flex w-full flex-col gap-3">
            <Link
              href="/create"
              className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#6214DC] to-[#7600F5] text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(109,22,232,0.24)] transition active:scale-[0.98]"
            >
              <span>{isKorean ? "모임 만들기" : "Create a Meetup"}</span>

              <span className="material-symbols-rounded ml-2 text-[20px]">
                arrow_forward
              </span>
            </Link>

            <Link
  href="/join"
  className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-[#6D16E8] bg-white text-[15px] font-bold text-[#6D16E8] transition active:scale-[0.98]"
>
  {isKorean ? "코드로 참여하기" : "Join with Code"}
</Link>
          </div>

          {/* 결과 보기 */}
<Link
href="/results"  className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-[#5D5D67] underline underline-offset-4 transition hover:text-[#6D16E8] active:scale-[0.98]"
>
  <span className="material-symbols-rounded text-[18px] text-[#7A6E54]">
    monitoring
  </span>

  {isKorean
    ? "모임 결과 보기"
    : "View meetup results"}
</Link>

          {/* 구분선 */}
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-20 bg-[#D8D5CE]" />

            <span className="material-symbols-rounded text-[18px] text-[#CFC5EA]">
              casino
            </span>

            <span className="h-px w-20 bg-[#D8D5CE]" />
          </div>

          {/* 하단 통계 박스 */}
          <section className="mt-10 grid w-full grid-cols-3 rounded-2xl border border-[#ECE7DE] bg-white px-2 py-4 shadow-[0_4px_10px_rgba(50,40,20,0.08)]">
            <StatItem
              icon="groups"
              value="1.2k+"
              label={isKorean ? "모임" : "meetups"}
              color="#8C61FF"
            />

            <StatItem
              icon="extension"
              value="500+"
              label={isKorean ? "게임" : "games"}
              color="#08775C"
              border
            />

            <StatItem
              icon="event_available"
              value=""
              label={isKorean ? "스마트 조율" : "Smart planning"}
              color="#6D16E8"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
  border = false,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[70px] flex-col items-center justify-center ${
        border ? "border-x border-[#E8E5DE]" : ""
      }`}
    >
      <span
        className="material-symbols-rounded material-symbols-filled mb-2 text-[24px]"
        style={{ color }}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className="text-[12px] text-[#0B1C30]">
        {value && <span>{value} </span>}
        <span>{label}</span>
      </div>
    </div>
  );
}