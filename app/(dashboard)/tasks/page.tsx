import { CheckSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { TaskForm } from "./TaskForm";
import { TaskRow } from "./TaskRow";

export default async function TasksPage() {
  const userId = await requireUserId();

  const [tasks, goals] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      include: { goal: { select: { id: true, title: true } } },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const todo = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={CheckSquare}
        color="blue"
        title="Задачи"
        subtitle={`${todo.length} в работе · ${done.length} выполнено`}
      />

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая задача
        </summary>
        <div className="mt-4">
          <TaskForm goals={goals} />
        </div>
      </details>

      <div className="flex flex-col gap-2">
        {todo.length === 0 && (
          <p className="text-sm text-muted">Нет активных задач. Отличное время добавить план на день.</p>
        )}
        {todo.map((task) => (
          <TaskRow key={task.id} task={task} goals={goals} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label mt-2">Выполнено</p>
          {done.map((task) => (
            <TaskRow key={task.id} task={task} goals={goals} />
          ))}
        </div>
      )}
    </div>
  );
}
