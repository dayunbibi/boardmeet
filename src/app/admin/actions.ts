"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPin, createAdminSession, clearAdminSession, requireAdmin } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const pin = String(formData.get("pin") ?? "");
  if (!verifyPin(pin)) {
    redirect("/admin?error=PIN이 올바르지 않습니다.");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin");
}

export async function createPollAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const type = String(formData.get("type") ?? "TIME");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const optionsRaw = String(formData.get("options") ?? "");

  const labels = optionsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title || labels.length < 2 || (type !== "TIME" && type !== "GAME")) {
    redirect(
      `/admin/polls/new?type=${type}&error=제목과 후보 항목(2개 이상)을 입력해주세요.`
    );
  }

  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  const poll = await prisma.poll.create({
    data: {
      type: type as "TIME" | "GAME",
      title,
      description: description || null,
      deadline,
      options: {
        create: labels.map((label, i) => ({ label, order: i })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/polls/${poll.id}`);
}

export async function closePollAction(pollId: string): Promise<void> {
  await requireAdmin();
  await prisma.poll.update({ where: { id: pollId }, data: { isClosed: true } });
  revalidatePath(`/admin/polls/${pollId}`);
  revalidatePath(`/poll/${pollId}`);
  revalidatePath("/");
}

export async function reopenPollAction(pollId: string): Promise<void> {
  await requireAdmin();
  await prisma.poll.update({ where: { id: pollId }, data: { isClosed: false } });
  revalidatePath(`/admin/polls/${pollId}`);
  revalidatePath(`/poll/${pollId}`);
  revalidatePath("/");
}

export async function deletePollAction(pollId: string): Promise<void> {
  await requireAdmin();
  await prisma.poll.delete({ where: { id: pollId } });
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function createNoticeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isPinned = formData.get("isPinned") === "on";

  if (!title || !body) {
    redirect("/admin/notices/new?error=제목과 내용을 입력해주세요.");
  }

  await prisma.notice.create({ data: { title, body, isPinned } });
  revalidatePath("/admin");
  revalidatePath("/notice");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateNoticeAction(noticeId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isPinned = formData.get("isPinned") === "on";

  if (!title || !body) {
    redirect(`/admin/notices/${noticeId}?error=제목과 내용을 입력해주세요.`);
  }

  await prisma.notice.update({ where: { id: noticeId }, data: { title, body, isPinned } });
  revalidatePath("/admin");
  revalidatePath("/notice");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteNoticeAction(noticeId: string): Promise<void> {
  await requireAdmin();
  await prisma.notice.delete({ where: { id: noticeId } });
  revalidatePath("/admin");
  revalidatePath("/notice");
  revalidatePath("/");
  redirect("/admin");
}
