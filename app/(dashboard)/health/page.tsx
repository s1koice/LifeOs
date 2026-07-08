import { HeartPulse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { daysAgoKey } from "@/lib/date";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader
        icon={HeartPulse}
        color="red"
        title="Здоровье"
        subtitle="Тренировки, добавки, сон, вес"
      />

      <HealthTabs
        workouts={workouts}
        supplements={supplements}
        sleepLogs={sleepLogs}
        weightLogs={weightLogs}
      />
    </div>
  );
}
