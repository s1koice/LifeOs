"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireUserId } from "@/lib/session";
import { toDateKey } from "@/lib/date";

const habitSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  color: z.string().default("#38bdf8"),
  targetPerWeek: z.coerce.number().int().min(1).max(7).default(7),
});

export async function createHabit(formData: FormData) {
  const userId = await requireUserId();
  const data = habitSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    color: formData.get("color") || "#38bdf8",
    targetPerWeek: formData.get("targetPerWeek") || 7,
  });

  await prisma.habit.create({ data: { userId, ...data } });
  revalidatePath("/habits");
  revalidatePath("/overview");
}

export async function updateHabit(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = habitSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    color: formData.get("color") || "#38bdf8",
    targetPerWeek: formData.get("targetPerWeek") || 7,
  });

  await prisma.habit.updateMany({ where: { id, userId }, data });
  revalidatePath("/habits");
  revalidatePath("/overview");
}

export async function archiveHabit(id: string, archived: boolean) {
  const userId = await requireUserId();
  await prisma.habit.updateMany({ where: { id, userId }, data: { archived } });
  revalidatePath("/habits");
  revalidatePath("/overview");
}

export async function deleteHabit(id: string) {
  const userId = await requireUserId();
  await prisma.habit.deleteMany({ where: { id, userId } });
  revalidatePath("/habits");
  revalidatePath("/overview");
}

export async function toggleHabitToday(habitId: string) {
  const user = await requireUser();
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id } });
  if (!habit) return;

  const dateKey = toDateKey(new Date(), user.timezone);
  const date = new Date(dateKey);

  const existing = await prisma.habitEntry.findUnique({
    where: { habitId_date: { habitId, date } },
  });

  if (existing) {
    await prisma.habitEntry.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitEntry.create({ data: { habitId, date, completed: true } });
  }

  revalidatePath("/habits");
  revalidatePath("/overview");
}
