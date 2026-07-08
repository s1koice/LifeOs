import { streamText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/ai/anthropic";
import { getAssistantTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  appendMessage,
  getOrCreateConversation,
  loadHistoryAsCoreMessages,
} from "@/lib/ai/conversation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  const userId = session.user.id;
  const body = await req.json();
  const clientMessages = (body.messages ?? []) as { role: string; content: string }[];
  const lastUserMessage = [...clientMessages].reverse().find((m) => m.role === "user");

  if (!lastUserMessage?.content) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const [user, conversation] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getOrCreateConversation(userId, "WEB"),
  ]);
  const history = await loadHistoryAsCoreMessages(conversation.id);

  await appendMessage(conversation.id, "USER", lastUserMessage.content);

  const result = streamText({
    model: anthropic(AI_MODEL),
    system: buildSystemPrompt({ userName: user.name, timezone: user.timezone }),
    messages: [...history, { role: "user", content: lastUserMessage.content }],
    tools: getAssistantTools(userId, user.timezone),
    maxSteps: 5,
    onFinish: async ({ text }) => {
      if (text) {
        await appendMessage(conversation.id, "ASSISTANT", text);
      }
    },
  });

  return result.toDataStreamResponse();
}
