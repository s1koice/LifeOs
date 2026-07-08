"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function refresh() {
  revalidatePath("/health");
  revalidatePath("/overview");
}

// Workouts
const workoutSchema = z.object({
  date: z.string().min(1),
  type: z.string().min(1).max(100),
  durationMin: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export async function createWorkout(formData: FormData) {
  const userId = await requireUserId();
  const data = workoutSchema.parse({
    date: formData.get("date"),
    type: formData.get("type"),
    durationMin: formData.get("durationMin") || null,
    notes: formData.get("notes") || null,
  });
  await prisma.workout.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  refresh();
}

export async function deleteWorkout(id: string) {
  const userId = await requireUserId();
  await prisma.workout.deleteMany({ where: { id, userId } });
  refresh();
}

// Supplements
const supplementSchema = z.object({
  name: z.string().min(1).max(150),
  dosage: z.string().max(100).optional().nullable(),
  takenAt: z.string().min(1),
});

export async function createSupplementLog(formData: FormData) {
  const userId = await requireUserId();
  const data = supplementSchema.parse({
    name: formData.get("name"),
    dosage: formData.get("dosage") || null,
    takenAt: formData.get("takenAt"),
  });
  await prisma.supplementLog.create({
    data: { userId, ...data, takenAt: new Date(data.takenAt) },
  });
  refresh();
}

export async function deleteSupplementLog(id: string) {
  const userId = await requireUserId();
  await prisma.supplementLog.deleteMany({ where: { id, userId } });
  refresh();
}

// Sleep
const sleepSchema = z.object({
  date: z.string().min(1),
  hours: z.coerce.number().min(0).max(24),
  quality: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function upsertSleepLog(formData: FormData) {
  const userId = await requireUserId();
  const data = sleepSchema.parse({
    date: formData.get("date"),
    hours: formData.get("hours"),
    quality: formData.get("quality") || null,
    notes: formData.get("notes") || null,
  });
  const date = new Date(data.date);
  await prisma.sleepLog.upsert({
    where: { userId_date: { userId, date } },
    update: { hours: data.hours, quality: data.quality, notes: data.notes },
    create: { userId, date, hours: data.hours, quality: data.quality, notes: data.notes },
  });
  refresh();
}

export async function deleteSleepLog(id: string) {
  const userId = await requireUserId();
  await prisma.sleepLog.deleteMany({ where: { id, userId } });
  refresh();
}

// Weight
const weightSchema = z.object({
  date: z.string().min(1),
  weightKg: z.coerce.number().positive(),
  notes: z.string().max(500).optional().nullable(),
});

export async function upsertWeightLog(formData: FormData) {
  const userId = await requireUserId();
  const data = weightSchema.parse({
    date: formData.get("date"),
    weightKg: formData.get("weightKg"),
    notes: formData.get("notes") || null,
  });
  const date = new Date(data.date);
  await prisma.weightLog.upsert({
    where: { userId_date: { userId, date } },
    update: { weightKg: data.weightKg, notes: data.notes },
    create: { userId, date, weightKg: data.weightKg, notes: data.notes },
  });
  refresh();
}

export async function deleteWeightLog(id: string) {
  const userId = await requireUserId();
  await prisma.weightLog.deleteMany({ where: { id, userId } });
  refresh();
}
