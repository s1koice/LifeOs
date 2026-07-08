import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { daysAgoKey } from "@/lib/date";
import { HealthTabs } from "./HealthTabs";

export default async function HealthPage() {
  const userId = await requireUserId();
  const since = new Date(daysAgoKey(60));

  const [workouts, supplements, sleepLogs, weightLogs] = await Promise.all([
    prisma.workout.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.supplementLog.findMany({
      where: { userId, takenAt: { gte: since } },
      orderBy: { takenAt: "desc" },
    }),
    prisma.sleepLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.weightLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Здоровье</h1>
        <p className="text-sm text-muted">Тренировки, добавки, сон, вес</p>
      </div>

      <HealthTabs
        workouts={workouts}
        supplements={supplements}
        sleepLogs={sleepLogs}
        weightLogs={weightLogs}
      />
    </div>
  );
}
