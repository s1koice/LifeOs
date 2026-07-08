"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(20000).default(""),
  tags: z.string().default(""),
  pinned: z.coerce.boolean().default(false),
});

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createNote(formData: FormData) {
  const userId = await requireUserId();
  const data = schema.parse({
    title: formData.get("title"),
    content: formData.get("content") || "",
    tags: formData.get("tags") || "",
    pinned: formData.get("pinned") === "on",
  });

  await prisma.note.create({
    data: {
      userId,
      title: data.title,
      content: data.content,
      tags: parseTags(data.tags),
      pinned: data.pinned,
    },
  });
  revalidatePath("/notes");
}

export async function updateNote(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = schema.parse({
    title: formData.get("title"),
    content: formData.get("content") || "",
    tags: formData.get("tags") || "",
    pinned: formData.get("pinned") === "on",
  });

  await prisma.note.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      content: data.content,
      tags: parseTags(data.tags),
      pinned: data.pinned,
    },
  });
  revalidatePath("/notes");
}

export async function deleteNote(id: string) {
  const userId = await requireUserId();
  await prisma.note.deleteMany({ where: { id, userId } });
  revalidatePath("/notes");
}

export async function togglePinNote(id: string, pinned: boolean) {
  const userId = await requireUserId();
  await prisma.note.updateMany({ where: { id, userId }, data: { pinned } });
  revalidatePath("/notes");
}
