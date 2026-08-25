"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDeviceId, getOrCreateDeviceId } from "@/lib/device";
import { isPollClosed } from "@/lib/polls";
import { getLocale } from "@/lib/i18n";

export async function submitVoteAction(pollId: string, formData: FormData): Promise<void> {
  const locale = await getLocale();
  const error = (ko: string, en: string) => encodeURIComponent(locale === "ko" ? ko : en);
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });
  if (!poll) redirect(`/poll/${pollId}?error=${error("투표를 찾을 수 없습니다.", "Poll not found.")}`);
  if (isPollClosed(poll)) redirect(`/poll/${pollId}?error=${error("마감된 투표입니다.", "This poll is closed.")}`);

  const voterName = String(formData.get("voterName") ?? "").trim();
  if (!voterName) redirect(`/poll/${pollId}?error=${error("이름을 입력해주세요.", "Please enter your name.")}`);
  if (voterName.length > 20) redirect(`/poll/${pollId}?error=${error("이름은 20자 이내로 입력해주세요.", "Name must be 20 characters or fewer.")}`);

  const validIds = new Set(poll.options.map((o) => o.id));
  const chosen = formData
    .getAll("optionIds")
    .map(String)
    .filter((id) => validIds.has(id));
  if (chosen.length === 0 && poll.type !== "TIME") {
    redirect(`/poll/${pollId}?error=${error("항목을 1개 이상 선택해주세요.", "Please select an option.")}`);
  }

  const deviceId = await getOrCreateDeviceId();

  await prisma.$transaction([
    prisma.vote.deleteMany({
      where: { deviceToken: deviceId, pollOption: { pollId } },
    }),
    prisma.vote.createMany({
      data: chosen.map((optionId) => ({
        pollOptionId: optionId,
        voterName,
        deviceToken: deviceId,
      })),
    }),
  ]);

  revalidatePath(`/poll/${pollId}`);
  revalidatePath("/");
}

export async function cancelVoteAction(pollId: string): Promise<void> {
  const deviceId = await getDeviceId();
  if (!deviceId) return;

  await prisma.vote.deleteMany({
    where: { deviceToken: deviceId, pollOption: { pollId } },
  });

  revalidatePath(`/poll/${pollId}`);
  revalidatePath("/");
}
