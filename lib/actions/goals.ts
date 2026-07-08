"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { GoalStatus } from "@prisma/client";

const goalSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(GoalStatus).default(GoalStatus.ACTIVE),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  deadline: z.string().optional().nullable(),
});

function parseGoalForm(formData: FormData) {
  return goalSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    category: formData.get("category") || null,
    status: formData.get("status") || GoalStatus.ACTIVE,
    progress: formData.get("progress") || 0,
    deadline: formData.get("deadline") || null,
  });
}

export async function createGoal(formData: FormData) {
  const userId = await requireUserId();
  const data = parseGoalForm(formData);

  await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      progress: data.progress,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/overview");
}

export async function updateGoal(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parseGoalForm(formData);

  await prisma.goal.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      progress: data.progress,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/overview");
}

export async function deleteGoal(id: string) {
  const userId = await requireUserId();
  await prisma.goal.deleteMany({ where: { id, userId } });
  revalidatePath("/goals");
  revalidatePath("/overview");
}

export async function setGoalProgress(id: string, progress: number) {
  const userId = await requireUserId();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  await prisma.goal.updateMany({
    where: { id, userId },
    data: {
      progress: clamped,
      status: clamped >= 100 ? GoalStatus.COMPLETED : undefined,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/overview");
}
