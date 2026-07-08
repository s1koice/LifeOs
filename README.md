# LifeOS

Личная операционная система жизни: цели, задачи, привычки, финансы, здоровье,
обучение, трейдинг, заметки, проекты — и проактивный AI-ассистент, который
сам выходит на связь утром и вечером через Telegram (или email, пока Telegram
не подключён).

Стек: Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + Neon Postgres ·
Auth.js v5 · Vercel AI SDK (Anthropic) · Vercel Cron · Telegram Bot API.

## Локальный запуск

```bash
npm install
cp .env.example .env         # заполните значения, см. ниже
npm run db:migrate:dev        # применить миграции к базе данных
npm run db:seed               # создать единственный аккаунт владельца
npm run dev
```

Откройте http://localhost:3000 и войдите с `OWNER_EMAIL` / `OWNER_PASSWORD`
из `.env`.

## Переменные окружения

Полный список с комментариями — в `.env.example`. Обязательные для базовой
работы: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `OWNER_EMAIL`,
`OWNER_PASSWORD`. Остальные включают конкретные функции:

| Переменная | Включает |
| --- | --- |
| `ANTHROPIC_API_KEY` | AI-ассистент (чат на сайте, утренний/вечерний разбор) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` | Telegram-бот |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email-дайджест как fallback, пока Telegram не подключён |
| `CRON_SECRET` | Защита cron-эндпоинтов (обязательно в проде) |

## Где взять ключи

- **Neon Postgres**: [neon.tech](https://neon.tech) → создать проект → скопировать
  `Pooled connection` в `DATABASE_URL` и `Direct connection` в `DIRECT_URL`.
- **Anthropic API key**: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
- **Telegram bot token**: в Telegram написать `@BotFather` → `/newbot` → следовать инструкциям.
- **Resend API key**: [resend.com/api-keys](https://resend.com/api-keys).

## Деплой на Vercel

```bash
npm i -g vercel
vercel link
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add AUTH_SECRET production
vercel env add ANTHROPIC_API_KEY production
vercel env add CRON_SECRET production
# ...и остальные переменные из .env.example, какие у вас есть

npm run db:migrate     # prisma migrate deploy, против продовой базы
vercel --prod
```

После деплоя выполните разовый сид владельца против продовой базы:
`OWNER_EMAIL=... OWNER_PASSWORD=... DATABASE_URL=... npm run db:seed`.

### Подключение Telegram-бота

1. Добавьте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`,
   `APP_URL` в env и передеплойте.
2. Как владелец, откройте `https://<ваш-домен>/api/telegram/setup` в браузере
   (залогинившись) — это зарегистрирует webhook в Telegram.
3. В Настройках приложения сгенерируйте код привязки и отправьте боту
   `/start КОД`.

Пока `TELEGRAM_BOT_TOKEN` не задан, утренние/вечерние сообщения будут
приходить на email через Resend (если `RESEND_API_KEY` задан), иначе — просто
сохраняться в базе и быть видны в разделе «Обзор» на сайте.

### Про расписание cron

`vercel.json` запускает проверку каждый час (`0 * * * *`). Каждый тик
проверяет, наступило ли (и не прошло ли больше 3 часов от) время чекина из
Настроек в вашем часовом поясе — так утренний и вечерний разбор
подстраиваются под конфигурацию без правки `vercel.json`, а разовое
опоздание/пропуск тика Vercel Cron не приводит к тому, что разбор не придёт
вообще (уникальность по дню всё равно гарантирует не более одной отправки).
Почасовые Cron Jobs требуют плана Vercel Pro; на Hobby-плане Cron может
запускаться не чаще одного раза в сутки — в этом случае задайте в
`vercel.json` фиксированное время (например, `"0 6 * * *"` в UTC), примерно
соответствующее вашему утру.

### Безопасность cron и Telegram-webhook

`CRON_SECRET` и `TELEGRAM_WEBHOOK_SECRET` — это единственная защита `/api/cron/*`
и `/api/telegram/webhook` (эти пути обязаны быть публичными, без сессии). В
production (`NODE_ENV=production`, как на Vercel) оба эндпоинта **обязаны**
иметь заданный секрет — без него они возвращают 401, а не открываются анонимно.
Обязательно задайте `CRON_SECRET` в Vercel env, а `TELEGRAM_WEBHOOK_SECRET` —
если подключаете бота.

## Модули

Обзор · Цели · Задачи · Привычки · Финансы · Здоровье · Обучение · Трейдинг ·
Заметки · Проекты · AI-ассистент · Настройки — полный CRUD на реальных данных
из Postgres, без заглушек.
