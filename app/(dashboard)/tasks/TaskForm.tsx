"use client";

import { useRef, useTransition } from "react";
import { createTask, updateTask } from "@/lib/actions/tasks";

type Goal = { id: string; title: string };

type TaskDefaults = {
  id?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  goalId?: string | null;
};

export function TaskForm({
  goals,
  defaults,
  onDone,
}: {
  goals: Goal[];
  defaults?: TaskDefaults;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateTask(defaults.id, formData);
      } else {
        await createTask(formData);
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
          placeholder="Что нужно сделать?"
        />
      </div>
      <div>
        <label className="label mb-1 block">Описание</label>
        <textarea
          name="description"
          defaultValue={defaults?.description ?? ""}
          className="input min-h-[70px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="label mb-1 block">Статус</label>
          <select name="status" defaultValue={defaults?.status ?? "TODO"} className="input">
            <option value="TODO">К выполнению</option>
            <option value="IN_PROGRESS">В процессе</option>
            <option value="DONE">Готово</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Приоритет</label>
          <select name="priority" defaultValue={defaults?.priority ?? "MEDIUM"} className="input">
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="URGENT">Срочно</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Срок</label>
          <input
            name="dueDate"
            type="date"
            defaultValue={
              defaults?.dueDate ? new Date(defaults.dueDate).toISOString().slice(0, 10) : ""
            }
            className="input"
          />
        </div>
        <div>
          <label className="label mb-1 block">Цель</label>
          <select name="goalId" defaultValue={defaults?.goalId ?? ""} className="input">
            <option value="">—</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить задачу"}
      </button>
    </form>
  );
}
