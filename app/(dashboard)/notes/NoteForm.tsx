"use client";

import { useRef, useTransition } from "react";
import { createNote, updateNote } from "@/lib/actions/notes";

type Defaults = {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  pinned?: boolean;
};

export function NoteForm({ defaults, onDone }: { defaults?: Defaults; onDone?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateNote(defaults.id, formData);
      } else {
        await createNote(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <input name="title" required defaultValue={defaults?.title} className="input" placeholder="Заголовок" />
      <textarea
        name="content"
        defaultValue={defaults?.content}
        className="input min-h-[140px]"
        placeholder="Текст заметки..."
      />
      <input
        name="tags"
        defaultValue={defaults?.tags?.join(", ")}
        className="input"
        placeholder="Теги через запятую"
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="pinned" defaultChecked={defaults?.pinned} />
        Закрепить
      </label>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить заметку"}
      </button>
    </form>
  );
}
