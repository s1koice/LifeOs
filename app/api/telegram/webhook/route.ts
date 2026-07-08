import { generateText } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { anthropic, AI_MODEL } from "@/lib/ai/anthropic";
import { getAssistantTools } from "@/lib/ai/tools";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  appendMessage,
  getOrCreateConversation,
  loadHistoryAsCoreMessages,
} from "@/lib/ai/conversation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (secret) {
    const incoming = req.headers.get("x-telegram-bot-api-secret-token");
    if (incoming !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Never allow this public, unauthenticated route to run in production
    // without a secret to verify the sender is really Telegram.
    return NextResponse.json(
      { error: "TELEGRAM_WEBHOOK_SECRET is not configured" },
      { status: 401 }
    );
  }

  const update = (await req.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (text.startsWith("/start")) {
    const code = text.split(/\s+/)[1];
    if (!code) {
      await sendTelegramMessage(
        chatId,
        "Привет! Я ассистент LifeOS. Получите код привязки в Настройках приложения и отправьте мне: /start КОД"
      );
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({ where: { telegramLinkCode: code } });
    const expired = user?.telegramLinkCodeExpiresAt && user.telegramLinkCodeExpiresAt < new Date();
    if (!user || expired) {
      await sendTelegramMessage(chatId, "Код не найден или устарел. Сгенерируйте новый в Настройках.");
      return NextResponse.json({ ok: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: chatId, telegramLinkCode: null, telegramLinkCodeExpiresAt: null },
    });
    await sendTelegramMessage(
      chatId,
      "Готово! Теперь я буду присылать сюда утренние и вечерние разборы, а вы можете писать мне в любое время."
    );
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { telegramChatId: chatId } });
  if (!user) {
    await sendTelegramMessage(
      chatId,
      "Этот чат ещё не привязан к LifeOS. Получите код в Настройках приложения и отправьте: /start КОД"
    );
    return NextResponse.json({ ok: true });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    await sendTelegramMessage(chatId, "AI пока не настроен на сервере (нет ANTHROPIC_API_KEY).");
    return NextResponse.json({ ok: true });
  }

  const conversation = await getOrCreateConversation(user.id, "TELEGRAM");
  const history = await loadHistoryAsCoreMessages(conversation.id);
  await appendMessage(conversation.id, "USER", text);

  const { text: reply } = await generateText({
    model: anthropic(AI_MODEL),
    system: buildSystemPrompt({ userName: user.name, timezone: user.timezone }),
    messages: [...history, { role: "user", content: text }],
    tools: getAssistantTools(user.id, user.timezone),
    maxSteps: 5,
  });

  await appendMessage(conversation.id, "ASSISTANT", reply);
  await sendTelegramMessage(chatId, reply);

  return NextResponse.json({ ok: true });
}
