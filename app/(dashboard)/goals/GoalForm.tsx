"use client";

import { useRef, useTransition } from "react";
import { createGoal, updateGoal } from "@/lib/actions/goals";

type GoalDefaults = {
  id?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  status?: string;
  progress?: number;
  deadline?: Date | null;
};

export function GoalForm({
  defaults,
  onDone,
}: {
  defaults?: GoalDefaults;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateGoal(defaults.id, formData);
      } else {
        await createGoal(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="form-grid grid gap-3">
      <div>
        <label className="label mb-1 block">Название</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="input"
          placeholder="Например: Выйти на доход $10k/мес"
        />
      </div>
      <div>
        <label className="label mb-1 block">Описание</label>
        <textarea
          name="description"
          defaultValue={defaults?.description ?? ""}
          className="input min-h-[80px]"
          placeholder="Детали, критерии успеха..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Категория</label>
          <input
            name="category"
            defaultValue={defaults?.category ?? ""}
            className="input"
            placeholder="Карьера, здоровье..."
          />
        </div>
        <div>
          <label className="label mb-1 block">Дедлайн</label>
          <input
            name="deadline"
            type="date"
            defaultValue={
              defaults?.deadline
                ? new Date(defaults.deadline).toISOString().slice(0, 10)
                : ""
            }
            className="input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Статус</label>
          <select name="status" defaultValue={defaults?.status ?? "ACTIVE"} className="input">
            <option value="ACTIVE">Активна</option>
            <option value="PAUSED">На паузе</option>
            <option value="COMPLETED">Завершена</option>
            <option value="ARCHIVED">В архиве</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Прогресс %</label>
          <input
            name="progress"
            type="number"
            min={0}
            max={100}
            defaultValue={defaults?.progress ?? 0}
            className="input"
          />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить цель"}
      </button>
    </form>
  );
}
