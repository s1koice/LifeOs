"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/overview", label: "Обзор", icon: "◧" },
  { href: "/goals", label: "Цели", icon: "◎" },
  { href: "/tasks", label: "Задачи", icon: "✓" },
  { href: "/habits", label: "Привычки", icon: "↻" },
  { href: "/finance", label: "Финансы", icon: "₪" },
  { href: "/health", label: "Здоровье", icon: "♥" },
  { href: "/learning", label: "Обучение", icon: "▤" },
  { href: "/trading", label: "Трейдинг", icon: "▲" },
  { href: "/notes", label: "Заметки", icon: "✎" },
  { href: "/projects", label: "Проекты", icon: "▣" },
  { href: "/assistant", label: "AI-ассистент", icon: "✦" },
  { href: "/settings", label: "Настройки", icon: "⚙" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-line bg-card/60 p-5 backdrop-blur-md md:flex">
        <Link href="/overview" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl2 bg-brand-gradient text-base font-black shadow-glow">
            L
          </div>
          <div>
            <p className="text-base font-bold leading-none">LifeOS</p>
            <p className="text-xs text-muted">Личный центр управления</p>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="panel-soft flex items-center justify-between p-3 text-sm">
          <span className="truncate text-muted">{userName || "Владелец"}</span>
          <form action={signOutAction}>
            <button type="submit" className="text-xs text-muted hover:text-ink">
              ⎋
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/overview" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-sm font-black">
            L
          </div>
          <span className="font-bold">LifeOS</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="btn-ghost !px-3 !py-2 text-sm"
          aria-label="Меню"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto border-l border-line bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold">Меню</span>
              <button onClick={() => setOpen(false)} className="btn-ghost !px-3 !py-1.5">
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
