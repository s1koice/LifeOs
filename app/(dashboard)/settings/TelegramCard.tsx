"use client";

import { useState, useTransition } from "react";
import { disconnectTelegram, generateTelegramLinkCode } from "@/lib/actions/settings";

export function TelegramCard({
  telegramChatId,
  telegramLinkCode,
  botConfigured,
  botUsername,
}: {
  telegramChatId: string | null;
  telegramLinkCode: string | null;
  botConfigured: boolean;
  botUsername: string | null;
}) {
  const [code, setCode] = useState(telegramLinkCode);
  const [isPending, startTransition] = useTransition();

  if (!botConfigured) {
    return (
      <div className="text-sm text-muted">
        <p>
          Telegram-бот ещё не подключён. Пока проактивные утренние и вечерние сообщения
          будут приходить на email (Resend), если он настроен.
        </p>
        <p className="mt-2">
          Чтобы подключить бота: создайте его через{" "}
          <span className="text-ink">@BotFather</span> в Telegram, добавьте{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5">TELEGRAM_BOT_TOKEN</code> в
          переменные окружения проекта и задеплойте заново.
        </p>
      </div>
    );
  }

  if (telegramChatId) {
    return (
      <div>
        <p className="text-sm text-accent-green">Подключён · chat ID: {telegramChatId}</p>
        <button
          onClick={() => startTransition(() => disconnectTelegram())}
          disabled={isPending}
          className="btn-danger mt-3 !px-4 !py-2 text-xs"
        >
          Отключить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-muted">
        1. Откройте бота{botUsername ? ` @${botUsername}` : ""} в Telegram.
        <br />
        2. Нажмите «Сгенерировать код» ниже.
        <br />
        3. Отправьте боту сообщение <code className="rounded bg-black/40 px-1.5 py-0.5">/start КОД</code>.
      </p>
      {code && (
        <p className="panel-soft w-fit px-4 py-2 text-xl font-bold tracking-widest">{code}</p>
      )}
      <button
        onClick={() =>
          startTransition(async () => {
            const newCode = await generateTelegramLinkCode();
            setCode(newCode);
          })
        }
        disabled={isPending}
        className="btn-primary w-fit"
      >
        {isPending ? "..." : "Сгенерировать код"}
      </button>
    </div>
  );
}
