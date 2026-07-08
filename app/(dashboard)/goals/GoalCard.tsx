"use client";

import { useState, useTransition } from "react";
import { deleteGoal, setGoalProgress } from "@/lib/actions/goals";
import { GoalForm } from "./GoalForm";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  progress: number;
  deadline: Date | null;
  tasks: { id: string; title: string; status: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Активна",
  PAUSED: "На паузе",
  COMPLETED: "Завершена",
  ARCHIVED: "В архиве",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "text-accent-blue",
  PAUSED: "text-accent-amber",
  COMPLETED: "text-accent-green",
  ARCHIVED: "text-muted",
};

export function GoalCard({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <GoalForm defaults={goal} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  const doneTasks = goal.tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{goal.title}</h3>
            <span className={`badge ${STATUS_COLOR[goal.status]}`}>
              {STATUS_LABEL[goal.status]}
            </span>
          </div>
          {goal.category && <p className="mt-0.5 text-xs text-muted">{goal.category}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
            Изменить
          </button>
          <button
            onClick={() => startTransition(() => deleteGoal(goal.id))}
            disabled={isPending}
            className="btn-danger !px-3 !py-1.5 text-xs"
          >
            Удалить
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="mt-2 text-sm text-muted">{goal.description}</p>
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Прогресс</span>
          <span>{goal.progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={goal.progress}
          onMouseUp={(e) =>
            startTransition(() => setGoalProgress(goal.id, Number(e.currentTarget.value)))
          }
          onTouchEnd={(e) =>
            startTransition(() => setGoalProgress(goal.id, Number(e.currentTarget.value)))
          }
          className="w-full accent-accent-blue"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        {goal.deadline && (
          <span>Дедлайн: {new Date(goal.deadline).toLocaleDateString("ru-RU")}</span>
        )}
        {goal.tasks.length > 0 && (
          <span>
            Задачи: {doneTasks}/{goal.tasks.length}
          </span>
        )}
      </div>
    </div>
  );
}
