"use client";

import { useRef, useTransition } from "react";
import { createHabit, updateHabit } from "@/lib/actions/habits";

type HabitDefaults = {
  id?: string;
  title?: string;
  description?: string | null;
  color?: string;
  targetPerWeek?: number;
};

const COLORS = ["#38bdf8", "#8b5cf6", "#34d399", "#fbbf24", "#fb7185"];

export function HabitForm({
  defaults,
  onDone,
}: {
  defaults?: HabitDefaults;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateHabit(defaults.id, formData);
      } else {
        await createHabit(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <div>
        <label className="label mb-1 block">Название</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="input"
          placeholder="Например: Тренировка"
        />
      </div>
      <div>
        <label className="label mb-1 block">Описание</label>
        <input
          name="description"
          defaultValue={defaults?.description ?? ""}
          className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Цель раз/неделю</label>
          <input
            name="targetPerWeek"
            type="number"
            min={1}
            max={7}
            defaultValue={defaults?.targetPerWeek ?? 7}
            className="input"
          />
        </div>
        <div>
          <label className="label mb-1 block">Цвет</label>
          <select name="color" defaultValue={defaults?.color ?? COLORS[0]} className="input">
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить привычку"}
      </button>
    </form>
  );
}
