"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { TradeDirection, TradeStatus } from "@prisma/client";

const schema = z.object({
  symbol: z.string().min(1).max(30).transform((s) => s.toUpperCase()),
  direction: z.nativeEnum(TradeDirection),
  status: z.nativeEnum(TradeStatus).default(TradeStatus.OPEN),
  entryPrice: z.coerce.number(),
  exitPrice: z.coerce.number().optional().nullable(),
  size: z.coerce.number().optional().nullable(),
  emotion: z.string().max(100).optional().nullable(),
  mistake: z.string().max(500).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
  openedAt: z.string().min(1),
  closedAt: z.string().optional().nullable(),
});

function parse(formData: FormData) {
  return schema.parse({
    symbol: formData.get("symbol"),
    direction: formData.get("direction"),
    status: formData.get("status") || TradeStatus.OPEN,
    entryPrice: formData.get("entryPrice"),
    exitPrice: formData.get("exitPrice") || null,
    size: formData.get("size") || null,
    emotion: formData.get("emotion") || null,
    mistake: formData.get("mistake") || null,
    note: formData.get("note") || null,
    openedAt: formData.get("openedAt"),
    closedAt: formData.get("closedAt") || null,
  });
}

function computePnl(direction: string, entry: number, exit: number | null, size: number | null) {
  if (exit == null) return null;
  const diff = direction === "LONG" ? exit - entry : entry - exit;
  return diff * (size ?? 1);
}

export async function createTrade(formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  const pnl = computePnl(data.direction, data.entryPrice, data.exitPrice ?? null, data.size ?? null);

  await prisma.trade.create({
    data: {
      userId,
      ...data,
      pnl,
      openedAt: new Date(data.openedAt),
      closedAt: data.closedAt ? new Date(data.closedAt) : null,
    },
  });
  revalidatePath("/trading");
  revalidatePath("/overview");
}

export async function updateTrade(id: string, formData: FormData) {
  const userId = await requireUserId();
  const data = parse(formData);
  const pnl = computePnl(data.direction, data.entryPrice, data.exitPrice ?? null, data.size ?? null);

  await prisma.trade.updateMany({
    where: { id, userId },
    data: {
      ...data,
      pnl,
      openedAt: new Date(data.openedAt),
      closedAt: data.closedAt ? new Date(data.closedAt) : null,
    },
  });
  revalidatePath("/trading");
  revalidatePath("/overview");
}

export async function deleteTrade(id: string) {
  const userId = await requireUserId();
  await prisma.trade.deleteMany({ where: { id, userId } });
  revalidatePath("/trading");
  revalidatePath("/overview");
}
