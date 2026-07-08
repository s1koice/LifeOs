import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { setTelegramWebhook } from "@/lib/telegram";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не настроен" }, { status: 400 });
  }
  if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "TELEGRAM_WEBHOOK_SECRET не настроен" }, { status: 400 });
  }

  const appUrl = process.env.APP_URL ?? new URL(req.url).origin;
  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const result = await setTelegramWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET);

  return NextResponse.json({ webhookUrl, result });
}
