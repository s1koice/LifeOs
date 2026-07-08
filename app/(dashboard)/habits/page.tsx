import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { daysAgoKey, toDateKey } from "@/lib/date";
import { computePercent, computeStreak } from "@/lib/habit-stats";
import { HabitForm } from "./HabitForm";
import { HabitCard } from "./HabitCard";

// Wide enough that computeStreak's unbounded walk can't be truncated by a
// missing query window for any realistic streak length.
const STREAK_LOOKBACK_DAYS = 400;

export default async function HabitsPage() {
  const user = await requireUser();

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: {
      entries: {
        where: { date: { gte: new Date(daysAgoKey(STREAK_LOOKBACK_DAYS, user.timezone)) } },
      },
    },
  });

  const withStats = habits.map((habit) => {
    const keys = new Set(habit.entries.map((e) => toDateKey(new Date(e.date), user.timezone)));
    return {
      habit,
      doneToday: keys.has(toDateKey(new Date(), user.timezone)),
      streak: computeStreak(keys, user.timezone),
      weekPercent: computePercent(keys, 7, user.timezone),
      monthPercent: computePercent(keys, 30, user.timezone),
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
