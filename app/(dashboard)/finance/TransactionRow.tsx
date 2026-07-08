"use client";

import { useState, useTransition } from "react";
import { deleteTransaction } from "@/lib/actions/finance";
import { TransactionForm } from "./TransactionForm";

type Tx = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  category: string;
  note: string | null;
  date: Date;
};

const TYPE_LABEL: Record<string, string> = {
  INCOME: "Доход",
  EXPENSE: "Расход",
  INVESTMENT: "Инвестиция",
};

const TYPE_COLOR: Record<string, string> = {
  INCOME: "text-accent-green",
  EXPENSE: "text-accent-red",
  INVESTMENT: "text-accent-violet",
};

export function TransactionRow({ tx }: { tx: Tx }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="panel p-5">
        <TransactionForm defaults={tx} onDone={() => setEditing(false)} />
        <button onClick={() => setEditing(false)} className="btn-ghost mt-3 w-full">
          Отмена
        </button>
      </div>
    );
  }

  const sign = tx.type === "EXPENSE" ? "-" : "+";

  return (
    <div className="panel flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium">
          <span className={TYPE_COLOR[tx.type]}>{TYPE_LABEL[tx.type]}</span> · {tx.category}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {new Date(tx.date).toLocaleDateString("ru-RU")}
          {tx.note ? ` · ${tx.note}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`font-semibold ${TYPE_COLOR[tx.type]}`}>
          {sign}
          {tx.amount.toFixed(2)} {tx.currency}
        </span>
        <button onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-xs">
          Изм.
        </button>
        <button
          onClick={() => startTransition(() => deleteTransaction(tx.id))}
          disabled={isPending}
          className="btn-danger !px-3 !py-1.5 text-xs"
        >
          Удал.
        </button>
      </div>
    </div>
  );
}
