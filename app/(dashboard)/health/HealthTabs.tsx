"use client";

import { useState, useTransition } from "react";
import {
  createWorkout,
  deleteWorkout,
  createSupplementLog,
  deleteSupplementLog,
  upsertSleepLog,
  deleteSleepLog,
  upsertWeightLog,
  deleteWeightLog,
} from "@/lib/actions/health";
import { WeightChart } from "./WeightChart";

type Workout = {
  id: string;
  date: Date;
  type: string;
  durationMin: number | null;
  notes: string | null;
};
type Supplement = { id: string; name: string; dosage: string | null; takenAt: Date };
type Sleep = { id: string; date: Date; hours: number; quality: number | null; notes: string | null };
type Weight = { id: string; date: Date; weightKg: number; notes: string | null };

const TABS = [
  { id: "workouts", label: "Тренировки" },
  { id: "supplements", label: "Добавки" },
  { id: "sleep", label: "Сон" },
  { id: "weight", label: "Вес" },
] as const;

const today = () => new Date().toISOString().slice(0, 10);

export function HealthTabs({
  workouts,
  supplements,
  sleepLogs,
  weightLogs,
}: {
  workouts: Workout[];
  supplements: Supplement[];
  sleepLogs: Sleep[];
  weightLogs: Weight[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("workouts");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn-ghost !rounded-full whitespace-nowrap ${
              tab === t.id ? "!bg-white/15 !text-ink" : ""
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "workouts" && (
        <div className="flex flex-col gap-4">
          <form
            action={(fd) => startTransition(() => createWorkout(fd))}
            className="panel grid gap-3 p-5 sm:grid-cols-4"
          >
            <input name="date" type="date" defaultValue={today()} className="input" />
            <input name="type" required placeholder="Тип (силовая, бег...)" className="input" />
            <input name="durationMin" type="number" min={0} placeholder="Минут" className="input" />
            <input name="notes" placeholder="Заметка" className="input" />
            <button type="submit" disabled={isPending} className="btn-primary sm:col-span-4">
              Добавить тренировку
            </button>
          </form>
          {workouts.map((w) => (
            <div key={w.id} className="panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{w.type}</p>
                <p className="text-xs text-muted">
                  {new Date(w.date).toLocaleDateString("ru-RU")}
                  {w.durationMin ? ` · ${w.durationMin} мин` : ""}
                  {w.notes ? ` · ${w.notes}` : ""}
                </p>
              </div>
              <button
                onClick={() => startTransition(() => deleteWorkout(w.id))}
                className="btn-danger !px-3 !py-1.5 text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
          {workouts.length === 0 && <p className="text-sm text-muted">Нет записей за 60 дней.</p>}
        </div>
      )}

      {tab === "supplements" && (
        <div className="flex flex-col gap-4">
          <form
            action={(fd) => startTransition(() => createSupplementLog(fd))}
            className="panel grid gap-3 p-5 sm:grid-cols-4"
          >
            <input name="name" required placeholder="Название" className="input" />
            <input name="dosage" placeholder="Дозировка" className="input" />
            <input name="takenAt" type="date" defaultValue={today()} className="input" />
            <button type="submit" disabled={isPending} className="btn-primary">
              Добавить
            </button>
          </form>
          {supplements.map((s) => (
            <div key={s.id} className="panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted">
                  {new Date(s.takenAt).toLocaleDateString("ru-RU")}
                  {s.dosage ? ` · ${s.dosage}` : ""}
                </p>
              </div>
              <button
                onClick={() => startTransition(() => deleteSupplementLog(s.id))}
                className="btn-danger !px-3 !py-1.5 text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
          {supplements.length === 0 && <p className="text-sm text-muted">Нет записей за 60 дней.</p>}
        </div>
      )}

      {tab === "sleep" && (
        <div className="flex flex-col gap-4">
          <form
            action={(fd) => startTransition(() => upsertSleepLog(fd))}
            className="panel grid gap-3 p-5 sm:grid-cols-4"
          >
            <input name="date" type="date" defaultValue={today()} className="input" />
            <input name="hours" type="number" step="0.1" min={0} max={24} required placeholder="Часов" className="input" />
            <input name="quality" type="number" min={1} max={5} placeholder="Качество 1-5" className="input" />
            <input name="notes" placeholder="Заметка" className="input" />
            <button type="submit" disabled={isPending} className="btn-primary sm:col-span-4">
              Сохранить сон
            </button>
          </form>
          {sleepLogs.map((s) => (
            <div key={s.id} className="panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{s.hours} ч{s.quality ? ` · качество ${s.quality}/5` : ""}</p>
                <p className="text-xs text-muted">
                  {new Date(s.date).toLocaleDateString("ru-RU")}
                  {s.notes ? ` · ${s.notes}` : ""}
                </p>
              </div>
              <button
                onClick={() => startTransition(() => deleteSleepLog(s.id))}
                className="btn-danger !px-3 !py-1.5 text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
          {sleepLogs.length === 0 && <p className="text-sm text-muted">Нет записей за 60 дней.</p>}
        </div>
      )}

      {tab === "weight" && (
        <div className="flex flex-col gap-4">
          {weightLogs.length > 1 && (
            <div className="panel p-5">
              <p className="mb-4 font-semibold">Динамика веса</p>
              <WeightChart data={weightLogs} />
            </div>
          )}
          <form
            action={(fd) => startTransition(() => upsertWeightLog(fd))}
            className="panel grid gap-3 p-5 sm:grid-cols-4"
          >
            <input name="date" type="date" defaultValue={today()} className="input" />
            <input name="weightKg" type="number" step="0.1" min={0} required placeholder="Вес, кг" className="input" />
            <input name="notes" placeholder="Заметка" className="input sm:col-span-2" />
            <button type="submit" disabled={isPending} className="btn-primary sm:col-span-4">
              Сохранить вес
            </button>
          </form>
          {weightLogs.map((w) => (
            <div key={w.id} className="panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{w.weightKg} кг</p>
                <p className="text-xs text-muted">
                  {new Date(w.date).toLocaleDateString("ru-RU")}
                  {w.notes ? ` · ${w.notes}` : ""}
                </p>
              </div>
              <button
                onClick={() => startTransition(() => deleteWeightLog(w.id))}
                className="btn-danger !px-3 !py-1.5 text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
          {weightLogs.length === 0 && <p className="text-sm text-muted">Нет записей за 60 дней.</p>}
        </div>
      )}
    </div>
  );
}
