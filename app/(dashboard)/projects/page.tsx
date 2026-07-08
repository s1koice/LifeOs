import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ProjectForm } from "./ProjectForm";
import { ProjectCard } from "./ProjectCard";

export default async function ProjectsPage() {
  const userId = await requireUserId();
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Проекты</h1>
        <p className="text-sm text-muted">{projects.length} всего</p>
      </div>

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новый проект
        </summary>
        <div className="mt-4">
          <ProjectForm />
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.length === 0 && <p className="text-sm text-muted">Пока нет проектов.</p>}
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
