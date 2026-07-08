"use client";

import { useRef, useTransition } from "react";
import { createTransaction, updateTransaction } from "@/lib/actions/finance";

type TxDefaults = {
  id?: string;
  type?: string;
  amount?: number;
  currency?: string;
  category?: string;
  note?: string | null;
  date?: Date;
};

export function TransactionForm({
  defaults,
  onDone,
}: {
  defaults?: TxDefaults;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateTransaction(defaults.id, formData);
      } else {
        await createTransaction(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Тип</label>
          <select name="type" defaultValue={defaults?.type ?? "EXPENSE"} className="input">
            <option value="EXPENSE">Расход</option>
            <option value="INCOME">Доход</option>
            <option value="INVESTMENT">Инвестиция</option>
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Дата</label>
          <input
            name="date"
            type="date"
            defaultValue={
              defaults?.date ? new Date(defaults.date).toISOString().slice(0, 10) : today
            }
            className="input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Сумма</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={defaults?.amount}
            className="input"
          />
        </div>
        <div>
          <label className="label mb-1 block">Валюта</label>
          <input
            name="currency"
            defaultValue={defaults?.currency ?? "USD"}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label mb-1 block">Категория</label>
        <input
          name="category"
          required
          defaultValue={defaults?.category}
          className="input"
          placeholder="Еда, транспорт, зарплата..."
        />
      </div>
      <div>
        <label className="label mb-1 block">Комментарий</label>
        <input name="note" defaultValue={defaults?.note ?? ""} className="input" />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить операцию"}
      </button>
    </form>
  );
}
