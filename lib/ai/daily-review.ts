import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { anthropic, AI_MODEL } from "@/lib/ai/anthropic";
import { toDateKey } from "@/lib/date";

async function gatherContext(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 2);

  const [tasks, habits, goals, recentTx] = await Promise.all([
    prisma.task.findMany({
      where: { userId, OR: [{ updatedAt: { gte: since } }, { dueDate: { gte: since } }] },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.habit.findMany({
      where: { userId, archived: false },
      include: { entries: { where: { date: { gte: since } } } },
    }),
    prisma.goal.findMany({ where: { userId, status: "ACTIVE" } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const todayKey = toDateKey(new Date());

  return {
    tasksSummary: tasks.map((t) => `- [${t.status}] ${t.title} (приоритет ${t.priority})`).join("\n") || "нет данных",
    habitsSummary:
      habits
        .map((h) => {
          const doneToday = h.entries.some((e) => toDateKey(new Date(e.date)) === todayKey);
          return `- ${h.title}: ${doneToday ? "выполнена сегодня" : "не отмечена сегодня"}`;
        })
        .join("\n") || "нет привычек",
    goalsSummary: goals.map((g) => `- ${g.title}: ${g.progress}% (статус ${g.status})`).join("\n") || "нет активных целей",
    financeSummary:
      recentTx.map((t) => `- ${t.type} ${t.amount} ${t.currency} (${t.category})`).join("\n") || "нет операций",
  };
}

export async function generateMorningMessage(user: User): Promise<string> {
  const ctx = await gatherContext(user.id);

  const { text } = await generateText({
    model: anthropic(AI_MODEL),
    system:
      "Ты личный AI-ассистент в LifeOS. Пиши компактные, тёплые, но честные сообщения на русском языке, без канцелярита. Формат: 3-5 коротких абзацев или пунктов, без markdown-заголовков.",
    prompt: `Сформируй утреннее сообщение для ${user.name ?? "пользователя"}. Основывайся на данных:

Задачи (последние 2 дня):
${ctx.tasksSummary}

Привычки:
${ctx.habitsSummary}

Активные цели:
${ctx.goalsSummary}

Финансы (последние операции):
${ctx.financeSummary}

Кратко подведи итог вчерашнего дня, отметь прогресс или тревожные сигналы, и предложи 2-3 конкретные задачи/фокус на сегодня. Задай 1 уточняющий вопрос в конце, если это уместно.`,
  });

  return text;
}

export async function generateEveningMessage(user: User): Promise<string> {
  const ctx = await gatherContext(user.id);

  const { text } = await generateText({
    model: anthropic(AI_MODEL),
    system:
      "Ты личный AI-ассистент в LifeOS. Пиши компактные, тёплые, но честные сообщения на русском языке, без канцелярита. Формат: 3-5 коротких абзацев или пунктов, без markdown-заголовков.",
    prompt: `Сформируй вечернее сообщение-разбор дня для ${user.name ?? "пользователя"}. Основывайся на данных:

Задачи:
${ctx.tasksSummary}

Привычки:
${ctx.habitsSummary}

Активные цели:
${ctx.goalsSummary}

Финансы:
${ctx.financeSummary}

Дай честную оценку дня, отметь, что получилось и что нет, и сформулируй 1-2 инсайта. Закончи коротким вопросом для рефлексии.`,
  });

  return text;
}
