"use client";

import { useRouter } from "next/navigation";

export function SearchBar({
  tags,
  currentQuery,
  currentTag,
}: {
  tags: string[];
  currentQuery?: string;
  currentTag?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q") as string;
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (currentTag) params.set("tag", currentTag);
          router.push(`/notes?${params.toString()}`);
        }}
      >
        <input
          name="q"
          defaultValue={currentQuery}
          placeholder="Поиск по заметкам..."
          className="input"
        />
      </form>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (currentQuery) params.set("q", currentQuery);
              router.push(`/notes?${params.toString()}`);
            }}
            className={`badge ${!currentTag ? "!bg-white/15" : ""}`}
          >
            Все
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const params = new URLSearchParams();
                if (currentQuery) params.set("q", currentQuery);
                params.set("tag", tag);
                router.push(`/notes?${params.toString()}`);
              }}
              className={`badge ${currentTag === tag ? "!bg-white/15" : ""}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
