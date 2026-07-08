import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { LearningForm } from "./LearningForm";
import { LearningCard } from "./LearningCard";

export default async function LearningPage() {
  const userId = await requireUserId();
  const items = await prisma.learningItem.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const inProgress = items.filter((i) => i.status === "IN_PROGRESS");
  const rest = items.filter((i) => i.status !== "IN_PROGRESS");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Обучение</h1>
        <p className="text-sm text-muted">Книги и курсы · {items.length} всего</p>
      </div>

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Добавить книгу или курс
        </summary>
        <div className="mt-4">
          <LearningForm />
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.length === 0 && <p className="text-sm text-muted">Список пуст.</p>}
        {inProgress.map((item) => (
          <LearningCard key={item.id} item={item} />
        ))}
        {rest.map((item) => (
          <LearningCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
