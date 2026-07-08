import { prisma } from "@/lib/prisma";
import { toDateKey } from "@/lib/date";
import { isSameHour } from "@/lib/cron-auth";
import { generateEveningMessage, generateMorningMessage } from "@/lib/ai/daily-review";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";
import { isEmailConfigured, sendDigestEmail } from "@/lib/email";
import type { ReviewType } from "@prisma/client";

export async function runDailyReviewForAllUsers(type: ReviewType) {
  const users = await prisma.user.findMany();
  const results: { userId: string; skipped: boolean; reason?: string }[] = [];

  for (const user of users) {
    const configuredTime = type === "MORNING" ? user.morningCheckinTime : user.eveningCheckinTime;

    if (!isSameHour(configuredTime, user.timezone)) {
      results.push({ userId: user.id, skipped: true, reason: "not checkin hour" });
      continue;
    }

    const dateKey = toDateKey(new Date());
    const already = await prisma.dailyReview.findUnique({
      where: { userId_date_type: { userId: user.id, date: new Date(dateKey), type } },
    });
    if (already) {
      results.push({ userId: user.id, skipped: true, reason: "already sent today" });
      continue;
    }

    const content =
      type === "MORNING" ? await generateMorningMessage(user) : await generateEveningMessage(user);

    let sentVia: "TELEGRAM" | "EMAIL" | "NONE" = "NONE";

    if (isTelegramConfigured() && user.telegramChatId) {
      await sendTelegramMessage(user.telegramChatId, content);
      sentVia = "TELEGRAM";
    } else if (isEmailConfigured()) {
      await sendDigestEmail(
        user.email,
        type === "MORNING" ? "LifeOS: утренний разбор" : "LifeOS: вечерний разбор",
        content
      );
      sentVia = "EMAIL";
    }

    await prisma.dailyReview.create({
      data: { userId: user.id, date: new Date(dateKey), type, content, sentVia },
    });

    results.push({ userId: user.id, skipped: false });
  }

  return results;
}
