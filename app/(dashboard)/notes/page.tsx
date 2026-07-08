import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { NoteForm } from "./NoteForm";
import { NoteCard } from "./NoteCard";
import { SearchBar } from "./SearchBar";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const userId = await requireUserId();
  const q = searchParams.q?.trim();
  const tag = searchParams.tag?.trim();

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(tag ? { tags: { has: tag } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  const allTags = await prisma.note.findMany({
    where: { userId },
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  allTags.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Заметки</h1>
        <p className="text-sm text-muted">{notes.length} найдено</p>
      </div>

      <SearchBar tags={[...tagSet].sort()} currentQuery={q} currentTag={tag} />

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая заметка
        </summary>
        <div className="mt-4">
          <NoteForm />
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.length === 0 && <p className="text-sm text-muted">Ничего не найдено.</p>}
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
