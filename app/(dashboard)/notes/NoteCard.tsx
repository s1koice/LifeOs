"use client";

import { useState, useTransition } from "react";
import { deleteNote, togglePinNote } from "@/lib/actions/notes";
import { NoteForm } from "./NoteForm";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: Date;
};

export function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <NoteForm defaults={note} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          {note.pinned && "📌 "}
          {note.title}
        </h3>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => startTransition(() => togglePinNote(note.id, !note.pinned))}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            {note.pinned ? "Открепить" : "Закрепить"}
          </button>
          <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
            Изм.
          </button>
          <button
            onClick={() => startTransition(() => deleteNote(note.id))}
            disabled={isPending}
            className="btn-danger !px-3 !py-1.5 text-xs"
          >
            Удал.
          </button>
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{note.content}</p>
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="badge">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted">
        {new Date(note.updatedAt).toLocaleString("ru-RU")}
      </p>
    </div>
  );
}
