"use client";

import { useState } from "react";
import { CalendarDays, Dices, Plus, X, ChevronLeft } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { createPollAction } from "../../actions";

const STEP_COUNT = 4;

export function PollWizard({ initialError }: { initialError?: string }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"TIME" | "GAME">("TIME");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<string[]>(["", ""]);

  const cleanItems = items.map((i) => i.trim()).filter(Boolean);
  const canNext =
    (step === 1 && !!type) ||
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && cleanItems.length >= 2) ||
    step === 4;

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={createPollAction} className="flex flex-col gap-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="options" value={cleanItems.join("\n")} />

      <div className="flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            aria-label="이전"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(step / STEP_COUNT) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-[13px] font-medium text-text-secondary">
          {step} / {STEP_COUNT}
        </span>
      </div>

      {initialError && (
        <div className="rounded-2xl bg-warning px-4 py-3 text-[14px] text-warning-text">
          {initialError}
        </div>
      )}

      <div className={step === 1 ? "flex flex-col gap-3" : "hidden"}>
        <h2 className="text-[19px] font-bold tracking-tight text-text-primary">
          어떤 투표를 만들까요?
        </h2>
        <button
          type="button"
          onClick={() => setType("TIME")}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.98] ${
            type === "TIME" ? "border-primary bg-soft-purple" : "border-border bg-surface"
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <CalendarDays size={20} />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-text-primary">
              모임 시간 투표
            </span>
            <span className="block text-[13px] text-text-secondary">
              후보 시간 중 가능한 시간을 골라요
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setType("GAME")}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.98] ${
            type === "GAME" ? "border-primary bg-soft-purple" : "border-border bg-surface"
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Dices size={20} />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-text-primary">
              보드게임 투표
            </span>
            <span className="block text-[13px] text-text-secondary">
              하고 싶은 게임 하나를 골라요
            </span>
          </span>
        </button>
      </div>

      <div className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-[19px] font-bold tracking-tight text-text-primary">
          제목을 알려주세요
        </h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-[13px] font-medium text-text-secondary">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 8월 정기모임 시간 투표"
            className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-[13px] font-medium text-text-secondary">
            설명 (선택)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="추가 안내 사항이 있다면 입력하세요"
            className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className={step === 3 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-[19px] font-bold tracking-tight text-text-primary">
          후보 항목을 추가하세요
        </h2>
        <p className="text-[13px] text-text-secondary">최소 2개 이상 입력해주세요</p>
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={type === "TIME" ? "8/22(토) 14시" : "카탄"}
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-text-primary outline-none focus:border-primary"
              />
              {items.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  aria-label="삭제"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition active:scale-90 active:bg-black/[0.05]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <SecondaryButton type="button" onClick={addItem} className="justify-center">
          <Plus size={16} />
          항목 추가
        </SecondaryButton>
      </div>

      <div className={step === 4 ? "flex flex-col gap-4" : "hidden"}>
        <h2 className="text-[19px] font-bold tracking-tight text-text-primary">
          마감 시각을 정하세요
        </h2>
        <p className="text-[13px] text-text-secondary">비워두면 마감 없이 계속 진행돼요</p>
        <input
          name="deadline"
          type="datetime-local"
          className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      {step < STEP_COUNT ? (
        <PrimaryButton type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
          다음
        </PrimaryButton>
      ) : (
        <PrimaryButton type="submit">투표 만들기</PrimaryButton>
      )}
    </form>
  );
}
