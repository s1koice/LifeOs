"use client";

import { useState, useTransition } from "react";
import { deleteLearningItem } from "@/lib/actions/learning";
import { LearningForm } from "./LearningForm";

type Item = {
  id: string;
  title: string;
  author: string | null;
  type: string;
  status: string;
  progress: number;
  rating: number | null;
  notes: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  BOOK: "Книга",
  COURSE: "Курс",
  ARTICLE: "Статья",
  VIDEO: "Видео",
};

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "В планах",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершено",
  DROPPED: "Брошено",
};

export function LearningCard({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <LearningForm defaults={item} onDone={() => setEditing(false)} />
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
          <h3 className="font-semibold">{item.title}</h3>
          {item.author && <p className="text-xs text-muted">{item.author}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
            Изменить
          </button>
          <button
            onClick={() => startTransition(() => deleteLearningItem(item.id))}
            disabled={isPending}
            className="btn-danger !px-3 !py-1.5 text-xs"
          >
            Удалить
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="badge">{TYPE_LABEL[item.type]}</span>
        <span className="badge">{STATUS_LABEL[item.status]}</span>
        {item.rating && <span className="badge text-accent-amber">{"★".repeat(item.rating)}</span>}
      </div>
      {item.status === "IN_PROGRESS" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
      {item.notes && <p className="mt-3 text-sm text-muted">{item.notes}</p>}
    </div>
  );
}
