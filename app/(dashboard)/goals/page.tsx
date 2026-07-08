import { Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { GoalForm } from "./GoalForm";
import { GoalCard } from "./GoalCard";

export default async function GoalsPage() {
  const userId = await requireUserId();

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
    include: { tasks: { select: { id: true, title: true, status: true } } },
  });

  const active = goals.filter((g) => g.status === "ACTIVE");
  const other = goals.filter((g) => g.status !== "ACTIVE");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Target}
        color="violet"
        title="Цели"
        subtitle={`${active.length} активных · ${goals.length} всего`}
      />

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая цель
        </summary>
        <div className="mt-4">
          <GoalForm />
        </div>
      </details>

      <div className="flex flex-col gap-4">
        {goals.length === 0 && (
          <p className="text-sm text-muted">Пока нет целей. Добавьте первую выше.</p>
        )}
        {active.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
        {other.length > 0 && (
          <>
            <p className="label mt-2">Завершённые / на паузе / в архиве</p>
            {other.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
