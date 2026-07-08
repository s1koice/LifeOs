"use client";

import { useRef, useTransition } from "react";
import { createProject, updateProject } from "@/lib/actions/projects";

type Defaults = {
  id?: string;
  name?: string;
  description?: string | null;
  status?: string;
};

export function ProjectForm({ defaults, onDone }: { defaults?: Defaults; onDone?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateProject(defaults.id, formData);
      } else {
        await createProject(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <input name="name" required defaultValue={defaults?.name} className="input" placeholder="Название проекта" />
      <textarea
        name="description"
        defaultValue={defaults?.description ?? ""}
        className="input min-h-[90px]"
        placeholder="Описание"
      />
      <select name="status" defaultValue={defaults?.status ?? "PLANNING"} className="input">
        <option value="PLANNING">Планирование</option>
        <option value="ACTIVE">В работе</option>
        <option value="ON_HOLD">На паузе</option>
        <option value="DONE">Завершён</option>
        <option value="ARCHIVED">В архиве</option>
      </select>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить проект"}
      </button>
    </form>
  );
}
