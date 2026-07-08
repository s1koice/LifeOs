"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { TransactionType } from "@prisma/client";

const txSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number().positive(),
  currency: z.string().min(1).max(10).default("USD"),
  category: z.string().min(1).max(100),
  note: z.string().max(500).optional().nullable(),
  date: z.string().min(1),
});

function parseTxForm(formData: FormData) {
  return txSchema.parse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "USD",
    category: formData.get("category"),
    note: formData.get("note") || null,
    date: formData.get("date"),
  });
}

export async function createTransaction(formData: FormData) {
  const userId = await requireUserId();
  const data = parseTxForm(formData);

  await prisma.transaction.create({
    data: { userId, ...data, date: new Date(data.date) },
  });

  revalidatePath("/finance");
  revalidatePath("/overview");
}

export async function updateTransaction(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parseTxForm(formData);

  await prisma.transaction.updateMany({
    where: { id, userId },
    data: { ...data, date: new Date(data.date) },
  });

  revalidatePath("/finance");
  revalidatePath("/overview");
}

export async function deleteTransaction(id: string) {
  const userId = await requireUserId();
  await prisma.transaction.deleteMany({ where: { id, userId } });
  revalidatePath("/finance");
  revalidatePath("/overview");
}
