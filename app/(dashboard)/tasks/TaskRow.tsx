"use client";

import { useState, useTransition } from "react";
import { deleteTask, toggleTaskDone } from "@/lib/actions/tasks";
import { TaskForm } from "./TaskForm";

type Goal = { id: string; title: string };

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  goalId: string | null;
  goal: { id: string; title: string } | null;
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "text-muted",
  MEDIUM: "text-accent-blue",
  HIGH: "text-accent-amber",
  URGENT: "text-accent-red",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  URGENT: "Срочно",
};

export function TaskRow({ task, goals }: { task: Task; goals: Goal[] }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const done = task.status === "DONE";

  if (editing) {
    return (
      <div className="panel p-5">
        <TaskForm goals={goals} defaults={task} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  return (
    <div className="panel flex items-start gap-3 p-4">
      <button
        onClick={() => startTransition(() => toggleTaskDone(task.id))}
        disabled={isPending}
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs transition ${
          done
            ? "border-accent-green bg-accent-green/20 text-accent-green"
            : "border-line text-transparent hover:border-accent-blue"
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${done ? "text-muted line-through" : ""}`}>{task.title}</p>
        {task.description && (
          <p className="mt-0.5 truncate text-sm text-muted">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className={`badge ${PRIORITY_COLOR[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.dueDate && (
            <span className="text-muted">
              {new Date(task.dueDate).toLocaleDateString("ru-RU")}
            </span>
          )}
          {task.goal && <span className="text-muted">↳ {task.goal.title}</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
          Изменить
        </button>
        <button
          onClick={() => startTransition(() => deleteTask(task.id))}
          disabled={isPending}
          className="btn-danger !px-3 !py-1.5 text-xs"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
