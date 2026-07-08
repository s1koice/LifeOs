"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().min(1).max(100),
  morningCheckinTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Формат ЧЧ:ММ"),
  eveningCheckinTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Формат ЧЧ:ММ"),
});

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();
  const data = profileSchema.parse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    morningCheckinTime: formData.get("morningCheckinTime"),
    eveningCheckinTime: formData.get("eveningCheckinTime"),
  });

  await prisma.user.update({ where: { id: userId }, data });
  revalidatePath("/settings");
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Минимум 8 символов"),
});

export async function updatePassword(formData: FormData) {
  const userId = await requireUserId();
  const data = passwordSchema.parse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new Error("Текущий пароль неверен");

  const passwordHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath("/settings");
}

const LINK_CODE_TTL_MINUTES = 15;

export async function generateTelegramLinkCode() {
  const userId = await requireUserId();
  const code = crypto.randomInt(100000, 999999).toString();
  const telegramLinkCodeExpiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000);
  await prisma.user.update({
    where: { id: userId },
    data: { telegramLinkCode: code, telegramLinkCodeExpiresAt },
  });
  revalidatePath("/settings");
  return code;
}

export async function disconnectTelegram() {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { telegramChatId: null, telegramLinkCode: null, telegramLinkCodeExpiresAt: null },
  });
  revalidatePath("/settings");
}
