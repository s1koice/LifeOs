"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { TaskStatus, TaskPriority } from "@prisma/client";

const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
});

function parseTaskForm(formData: FormData) {
  return taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    status: formData.get("status") || TaskStatus.TODO,
    priority: formData.get("priority") || TaskPriority.MEDIUM,
    dueDate: formData.get("dueDate") || null,
    goalId: formData.get("goalId") || null,
  });
}

export async function createTask(formData: FormData) {
  const userId = await requireUserId();
  const data = parseTaskForm(formData);

  await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      goalId: data.goalId || null,
      completedAt: data.status === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/overview");
  revalidatePath("/goals");
}

export async function updateTask(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parseTaskForm(formData);

  await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      goalId: data.goalId || null,
      completedAt: data.status === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/overview");
  revalidatePath("/goals");
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();
  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath("/tasks");
  revalidatePath("/overview");
  revalidatePath("/goals");
}

export async function toggleTaskDone(id: string) {
  const userId = await requireUserId();
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) return;

  const nowDone = task.status !== "DONE";
  await prisma.task.update({
    where: { id },
    data: {
      status: nowDone ? "DONE" : "TODO",
      completedAt: nowDone ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/overview");
  revalidatePath("/goals");
}
