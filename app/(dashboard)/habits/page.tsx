import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { daysAgoKey, toDateKey } from "@/lib/date";
import { computePercent, computeStreak } from "@/lib/habit-stats";
import { HabitForm } from "./HabitForm";
import { HabitCard } from "./HabitCard";

export default async function HabitsPage() {
  const userId = await requireUserId();

  const habits = await prisma.habit.findMany({
    where: { userId, archived: false },
    orderBy: { createdAt: "asc" },
    include: {
      entries: {
        where: { date: { gte: new Date(daysAgoKey(90)) } },
      },
    },
  });

  const withStats = habits.map((habit) => {
    const keys = new Set(habit.entries.map((e) => toDateKey(new Date(e.date))));
    return {
      habit,
      doneToday: keys.has(toDateKey(new Date())),
      streak: computeStreak(keys),
      weekPercent: computePercent(keys, 7),
      monthPercent: computePercent(keys, 30),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Привычки</h1>
        <p className="text-sm text-muted">{habits.length} трекеров</p>
      </div>

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая привычка
        </summary>
        <div className="mt-4">
          <HabitForm />
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {withStats.length === 0 && (
          <p className="text-sm text-muted">Пока нет привычек для трекинга.</p>
        )}
        {withStats.map(({ habit, doneToday, streak, weekPercent, monthPercent }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            doneToday={doneToday}
            streak={streak}
            weekPercent={weekPercent}
            monthPercent={monthPercent}
          />
        ))}
      </div>
    </div>
  );
}
