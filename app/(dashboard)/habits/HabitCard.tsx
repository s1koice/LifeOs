"use client";

import { useState, useTransition } from "react";
import { archiveHabit, deleteHabit, toggleHabitToday } from "@/lib/actions/habits";
import { HabitForm } from "./HabitForm";

type Habit = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  targetPerWeek: number;
};

export function HabitCard({
  habit,
  doneToday,
  streak,
  weekPercent,
  monthPercent,
}: {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  weekPercent: number;
  monthPercent: number;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <HabitForm defaults={habit} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: habit.color }} />
            <h3 className="font-semibold">{habit.title}</h3>
          </div>
          {habit.description && (
            <p className="mt-0.5 text-xs text-muted">{habit.description}</p>
          )}
        </div>
        <button
          onClick={() => startTransition(() => toggleHabitToday(habit.id))}
          disabled={isPending}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl2 border text-lg transition ${
            doneToday
              ? "border-accent-green bg-accent-green/20 text-accent-green"
              : "border-line text-muted hover:border-accent-blue"
          }`}
        >
          ✓
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="panel-soft p-2.5">
          <p className="text-lg font-bold">{streak}</p>
          <p className="text-[11px] text-muted">стрик, дней</p>
        </div>
        <div className="panel-soft p-2.5">
          <p className="text-lg font-bold">{weekPercent}%</p>
          <p className="text-[11px] text-muted">неделя</p>
        </div>
        <div className="panel-soft p-2.5">
          <p className="text-lg font-bold">{monthPercent}%</p>
          <p className="text-[11px] text-muted">месяц</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 text-xs">
        <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5">
          Изменить
        </button>
        <button
          onClick={() => startTransition(() => archiveHabit(habit.id, true))}
          className="btn-ghost !px-3 !py-1.5"
        >
          В архив
        </button>
        <button
          onClick={() => startTransition(() => deleteHabit(habit.id))}
          disabled={isPending}
          className="btn-danger !px-3 !py-1.5"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
