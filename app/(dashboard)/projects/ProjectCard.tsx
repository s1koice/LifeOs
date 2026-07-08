"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/lib/actions/projects";
import { ProjectForm } from "./ProjectForm";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "Планирование",
  ACTIVE: "В работе",
  ON_HOLD: "На паузе",
  DONE: "Завершён",
  ARCHIVED: "В архиве",
};

const STATUS_COLOR: Record<string, string> = {
  PLANNING: "text-muted",
  ACTIVE: "text-accent-blue",
  ON_HOLD: "text-accent-amber",
  DONE: "text-accent-green",
  ARCHIVED: "text-muted",
};

export function ProjectCard({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <ProjectForm defaults={project} onDone={() => setEditing(false)} />
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
          <h3 className="font-semibold">{project.name}</h3>
          <span className={`badge mt-1.5 inline-block ${STATUS_COLOR[project.status]}`}>
            {STATUS_LABEL[project.status]}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
            Изм.
          </button>
          <button
            onClick={() => startTransition(() => deleteProject(project.id))}
            disabled={isPending}
            className="btn-danger !px-3 !py-1.5 text-xs"
          >
            Удал.
          </button>
        </div>
      </div>
      {project.description && <p className="mt-2 text-sm text-muted">{project.description}</p>}
    </div>
  );
}
