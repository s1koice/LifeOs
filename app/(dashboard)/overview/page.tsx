import Link from "next/link";
import { CheckSquare, Flame, Target, Wallet, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { daysAgoKey, toDateKey } from "@/lib/date";
import { computeStreak } from "@/lib/habit-stats";
import { greeting } from "@/lib/greeting";
import { IconChip } from "@/components/IconChip";
import { TaskRow } from "@/app/(dashboard)/tasks/TaskRow";

const STREAK_LOOKBACK_DAYS = 400;

export default async function OverviewPage() {
  const user = await requireUser();
  const userId = user.id;
  const todayStart = new Date(toDateKey(new Date(), user.timezone));
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const since = new Date(daysAgoKey(STREAK_LOOKBACK_DAYS, user.timezone));

  const [tasksToday, activeGoals, habits, lastReview, monthExpenseAgg]  = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: { not: "DONE" },
        OR: [{ dueDate: { gte: todayStart, lt: todayEnd } }, { dueDate: null }],
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 8,
      include: { goal: { select: { id: true, title: true } } },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { deadline: "asc" },
      take: 4,
    }),
    prisma.habit.findMany({
      where: { userId, archived: false },
      include: { entries: { where: { date: { gte: since } } } },
    }),
    prisma.dailyReview.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
  ]);

  const habitsWithStreak = habits.map((h) => {
    const keys = new Set(h.entries.map((e) => toDateKey(new Date(e.date), user.timezone)));
    return {
      id: h.id,
      title: h.title,
      color: h.color,
      doneToday: keys.has(toDateKey(new Date(), user.timezone)),
      streak: computeStreak(keys, user.timezone),
    };
  });

  const goalsList = activeGoals.map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    deadline: g.deadline,
  }));

  const habitsDone = habitsWithStreak.filter((h) => h.doneToday).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="panel relative overflow-hidden bg-gradient-to-br from-[#1e293bcc] to-[#0f172acc] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent-violet/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-muted">
            {greeting()}
            {user.name ? `, ${user.name}` : ""}!
          </p>
          <h1 className="mt-1 text-2xl font-bold">Главное за сегодня</h1>
          <p className="mt-1 text-sm text-muted">
            {new Date().toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="stat-tile">
          <div className="flex items-center gap-2">
            <IconChip icon={CheckSquare} color="blue" size="sm" />
            <p className="label">Задач сегодня</p>
          </div>
          <p className="text-2xl font-bold">{tasksToday.length}</p>
        </div>
        <div className="stat-tile">
          <div className="flex items-center gap-2">
            <IconChip icon={Flame} color="green" size="sm" />
            <p className="label">Привычки закрыты</p>
          </div>
          <p className="text-2xl font-bold">
            {habitsDone}/{habitsWithStreak.length}
          </p>
        </div>
        <div className="stat-tile">
          <div className="flex items-center gap-2">
            <IconChip icon={Target} color="violet" size="sm" />
            <p className="label">Активных целей</p>
          </div>
          <p className="text-2xl font-bold">{goalsList.length}</p>
        </div>
        <div className="stat-tile">
          <div className="flex items-center gap-2">
            <IconChip icon={Wallet} color="amber" size="sm" />
            <p className="label">Расходы в этом месяце</p>
          </div>
          <p className="text-2xl font-bold">
            {(monthExpenseAgg._sum.amount ?? 0).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChip icon={CheckSquare} color="blue" size="sm" />
              <h2 className="font-semibold">Задачи на сегодня</h2>
            </div>
            <Link href="/tasks" className="text-xs text-accent-blue">
              Все задачи →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {tasksToday.length === 0 && (
              <p className="text-sm text-muted">Нет задач на сегодня. Загляните в раздел «Задачи».</p>
            )}
            {tasksToday.map((task) => (
              <TaskRow key={task.id} task={task} goals={[]} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChip icon={Flame} color="green" size="sm" />
              <h2 className="font-semibold">Привычки</h2>
            </div>
            <Link href="/habits" className="text-xs text-accent-blue">
              Все привычки →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {habitsWithStreak.length === 0 && (
              <p className="text-sm text-muted">Пока нет привычек для трекинга.</p>
            )}
            {habitsWithStreak.map((h) => (
              <div key={h.id} className="panel flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: h.color }} />
                  <span className="text-sm font-medium">{h.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className={h.streak > 0 ? "text-accent-amber" : ""}>{h.streak} 🔥</span>
                  <span className={h.doneToday ? "text-accent-green" : ""}>
                    {h.doneToday ? "✓ сегодня" : "не отмечено"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChip icon={Target} color="violet" size="sm" />
              <h2 className="font-semibold">Ближайшие цели</h2>
            </div>
            <Link href="/goals" className="text-xs text-accent-blue">
              Все цели →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {goalsList.length === 0 && <p className="text-sm text-muted">Нет активных целей.</p>}
            {goalsList.map((g) => (
              <div key={g.id} className="panel p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{g.title}</span>
                  <span className="text-muted">{g.progress}%</span>
                </div>
                {g.deadline && (
                  <p className="mt-1 text-xs text-muted">
                    до {new Date(g.deadline).toLocaleDateString("ru-RU")}
                  </p>
                )}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconChip icon={Sparkles} color="violet" size="sm" />
              <h2 className="font-semibold">Последний AI-разбор</h2>
            </div>
            <Link href="/assistant" className="text-xs text-accent-blue">
              Открыть ассистента →
            </Link>
          </div>
          {lastReview ? (
            <div className="panel p-4">
              <p className="text-xs text-muted">
                {lastReview.type === "MORNING" ? "Утренний" : "Вечерний"} ·{" "}
                {new Date(lastReview.date).toLocaleDateString("ru-RU")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{lastReview.content}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Пока нет AI-разборов. Они появятся после первого утреннего/вечернего чекина.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
