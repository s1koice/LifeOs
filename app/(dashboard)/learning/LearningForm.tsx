"use client";

import { useRef, useTransition } from "react";
import { createLearningItem, updateLearningItem } from "@/lib/actions/learning";

type Defaults = {
  id?: string;
  title?: string;
  author?: string | null;
  type?: string;
  status?: string;
  progress?: number;
  rating?: number | null;
  notes?: string | null;
};

export function LearningForm({
  defaults,
  onDone,
}: {
  defaults?: Defaults;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateLearningItem(defaults.id, formData);
      } else {
        await createLearningItem(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="title" required defaultValue={defaults?.title} className="input" placeholder="Название" />
        <input name="author" defaultValue={defaults?.author ?? ""} className="input" placeholder="Автор" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select name="type" defaultValue={defaults?.type ?? "BOOK"} className="input">
          <option value="BOOK">Книга</option>
          <option value="COURSE">Курс</option>
          <option value="ARTICLE">Статья</option>
          <option value="VIDEO">Видео</option>
        </select>
        <select name="status" defaultValue={defaults?.status ?? "PLANNED"} className="input">
          <option value="PLANNED">В планах</option>
          <option value="IN_PROGRESS">Читаю/прохожу</option>
          <option value="COMPLETED">Завершено</option>
          <option value="DROPPED">Брошено</option>
        </select>
        <input
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={defaults?.progress ?? 0}
          className="input"
          placeholder="Прогресс %"
        />
        <input
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={defaults?.rating ?? ""}
          className="input"
          placeholder="Оценка 1-5"
        />
      </div>
      <textarea
        name="notes"
        defaultValue={defaults?.notes ?? ""}
        className="input min-h-[70px]"
        placeholder="Заметки"
      />
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
      </button>
    </form>
  );
}
