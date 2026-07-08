"use client";

import { useState, useTransition } from "react";
import { deleteTrade } from "@/lib/actions/trading";
import { TradeForm } from "./TradeForm";

type Trade = {
  id: string;
  symbol: string;
  direction: string;
  status: string;
  entryPrice: number;
  exitPrice: number | null;
  size: number | null;
  pnl: number | null;
  emotion: string | null;
  mistake: string | null;
  note: string | null;
  openedAt: Date;
  closedAt: Date | null;
};

export function TradeRow({ trade }: { trade: Trade }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <TradeForm defaults={trade} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{trade.symbol}</span>
            <span
              className={`badge ${
                trade.direction === "LONG" ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {trade.direction}
            </span>
            <span className="badge">{trade.status === "OPEN" ? "Открыта" : "Закрыта"}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Вход {trade.entryPrice}
            {trade.exitPrice != null ? ` → Выход ${trade.exitPrice}` : ""}
            {trade.size ? ` · размер ${trade.size}` : ""}
          </p>
          <p className="text-xs text-muted">
            {new Date(trade.openedAt).toLocaleString("ru-RU")}
          </p>
          {(trade.emotion || trade.mistake) && (
            <p className="mt-1 text-xs text-muted">
              {trade.emotion && `Эмоция: ${trade.emotion}`}
              {trade.emotion && trade.mistake && " · "}
              {trade.mistake && `Ошибка: ${trade.mistake}`}
            </p>
          )}
          {trade.note && <p className="mt-1 text-sm text-muted">{trade.note}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {trade.pnl != null && (
            <span
              className={`font-bold ${trade.pnl >= 0 ? "text-accent-green" : "text-accent-red"}`}
            >
              {trade.pnl >= 0 ? "+" : ""}
              {trade.pnl.toFixed(2)}
            </span>
          )}
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
              Изм.
            </button>
            <button
              onClick={() => startTransition(() => deleteTrade(trade.id))}
              disabled={isPending}
              className="btn-danger !px-3 !py-1.5 text-xs"
            >
              Удал.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
