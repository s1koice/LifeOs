import { prisma } from "@/lib/prisma";
import type { AiChannel } from "@prisma/client";
import type { CoreMessage } from "ai";

export async function getOrCreateConversation(userId: string, channel: AiChannel) {
  const existing = await prisma.aiConversation.findFirst({
    where: { userId, channel },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.aiConversation.create({
    data: { userId, channel },
  });
}

export async function loadHistoryAsCoreMessages(
  conversationId: string,
  limit = 40
): Promise<CoreMessage[]> {
  const messages = await prisma.aiMessage.findMany({
    where: { conversationId, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));
}

export async function appendMessage(
  conversationId: string,
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL",
  content: string,
  extra?: { toolName?: string; toolCallId?: string }
) {
  await prisma.aiMessage.create({
    data: {
      conversationId,
      role,
      content,
      toolName: extra?.toolName,
      toolCallId: extra?.toolCallId,
    },
  });
  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}
