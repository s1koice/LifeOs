"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ProjectStatus } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
});

function parse(formData: FormData) {
  return schema.parse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    status: formData.get("status") || ProjectStatus.PLANNING,
  });
}

export async function createProject(formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  await prisma.project.create({ data: { userId, ...data } });
  revalidatePath("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  await prisma.project.updateMany({ where: { id, userId }, data });
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const userId = await requireUserId();
  await prisma.project.deleteMany({ where: { id, userId } });
  revalidatePath("/projects");
}
