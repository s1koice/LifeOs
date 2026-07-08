import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { TelegramCard } from "./TelegramCard";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const botConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || null;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-semibold">Профиль и чекины</h2>
        <ProfileForm user={user} />
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-semibold">Пароль</h2>
        <PasswordForm />
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-semibold">Telegram-бот</h2>
        <TelegramCard
          telegramChatId={user.telegramChatId}
          telegramLinkCode={user.telegramLinkCode}
          botConfigured={botConfigured}
          botUsername={botUsername}
        />
      </div>
    </div>
  );
}
