"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { LearningStatus, LearningType } from "@prisma/client";

const schema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().max(200).optional().nullable(),
  type: z.nativeEnum(LearningType).default(LearningType.BOOK),
  status: z.nativeEnum(LearningStatus).default(LearningStatus.PLANNED),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

function parse(formData: FormData) {
  return schema.parse({
    title: formData.get("title"),
    author: formData.get("author") || null,
    type: formData.get("type") || LearningType.BOOK,
    status: formData.get("status") || LearningStatus.PLANNED,
    progress: formData.get("progress") || 0,
    rating: formData.get("rating") || null,
    notes: formData.get("notes") || null,
  });
}

export async function createLearningItem(formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  await prisma.learningItem.create({
    data: {
      userId,
      ...data,
      startedAt: data.status !== "PLANNED" ? new Date() : null,
      finishedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });
  revalidatePath("/learning");
  revalidatePath("/overview");
}

export async function updateLearningItem(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  await prisma.learningItem.updateMany({
    where: { id, userId },
    data: {
      ...data,
      finishedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });
  revalidatePath("/learning");
  revalidatePath("/overview");
}

export async function deleteLearningItem(id: string) {
  const userId = await requireUserId();
  await prisma.learningItem.deleteMany({ where: { id, userId } });
  revalidatePath("/learning");
  revalidatePath("/overview");
}
