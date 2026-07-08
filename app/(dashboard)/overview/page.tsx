import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { toDateKey } from "@/lib/date";
import { computeStreak } from "@/lib/habit-stats";
import { TaskRow } from "@/app/(dashboard)/tasks/TaskRow";

export default async function OverviewPage() {
  const userId = await requireUserId();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);

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
      include: { entries: { where: { date: { gte: since90 } } } },
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
    const keys = new Set(h.entries.map((e) => toDateKey(new Date(e.date))));
    return {
      id: h.id,
      title: h.title,
      color: h.color,
      doneToday: keys.has(toDateKey(new Date())),
      streak: computeStreak(keys),
    };
  });

  const goalsList = activeGoals.map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    deadline: g.deadline,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="panel bg-gradient-to-br from-[#1e293bcc] to-[#0f172acc] p-6">
        <p className="text-sm text-muted">Сводка</p>
        <h1 className="mt-1 text-2xl font-bold">Главное за сегодня</h1>
        <p className="mt-1 text-sm text-muted">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="stat-tile">
          <p className="label">Задач сегодня</p>
          <p className="text-2xl font-bold">{tasksToday.length}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Привычки закрыты</p>
          <p className="text-2xl font-bold">
            {habitsWithStreak.filter((h) => h.doneToday).length}/{habitsWithStreak.length}
          </p>
        </div>
        <div className="stat-tile">
          <p className="label">Активных целей</p>
          <p className="text-2xl font-bold">{goalsList.length}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Расходы в этом месяце</p>
          <p className="text-2xl font-bold">
            {(monthExpenseAgg._sum.amount ?? 0).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Задачи на сегодня</h2>
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
            <h2 className="font-semibold">Привычки</h2>
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
                  <span>{h.streak} 🔥</span>
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
            <h2 className="font-semibold">Ближайшие цели</h2>
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
            <h2 className="font-semibold">Последний AI-разбор</h2>
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
