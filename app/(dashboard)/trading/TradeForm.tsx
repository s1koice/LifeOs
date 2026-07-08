"use client";

import { useRef, useTransition } from "react";
import { createTrade, updateTrade } from "@/lib/actions/trading";

type Defaults = {
  id?: string;
  symbol?: string;
  direction?: string;
  status?: string;
  entryPrice?: number;
  exitPrice?: number | null;
  size?: number | null;
  emotion?: string | null;
  mistake?: string | null;
  note?: string | null;
  openedAt?: Date;
  closedAt?: Date | null;
};

function toDT(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

export function TradeForm({ defaults, onDone }: { defaults?: Defaults; onDone?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit && defaults?.id) {
        await updateTrade(defaults.id, formData);
      } else {
        await createTrade(formData);
        formRef.current?.reset();
      }
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input name="symbol" required defaultValue={defaults?.symbol} className="input" placeholder="Символ (BTC, AAPL...)" />
        <select name="direction" defaultValue={defaults?.direction ?? "LONG"} className="input">
          <option value="LONG">Long</option>
          <option value="SHORT">Short</option>
        </select>
        <select name="status" defaultValue={defaults?.status ?? "OPEN"} className="input">
          <option value="OPEN">Открыта</option>
          <option value="CLOSED">Закрыта</option>
        </select>
        <input name="size" type="number" step="any" defaultValue={defaults?.size ?? ""} className="input" placeholder="Размер" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input name="entryPrice" type="number" step="any" required defaultValue={defaults?.entryPrice} className="input" placeholder="Цена входа" />
        <input name="exitPrice" type="number" step="any" defaultValue={defaults?.exitPrice ?? ""} className="input" placeholder="Цена выхода" />
        <input
          name="openedAt"
          type="datetime-local"
          required
          defaultValue={toDT(defaults?.openedAt) || new Date().toISOString().slice(0, 16)}
          className="input"
        />
        <input name="closedAt" type="datetime-local" defaultValue={toDT(defaults?.closedAt)} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="emotion" defaultValue={defaults?.emotion ?? ""} className="input" placeholder="Эмоция (спокоен, FOMO...)" />
        <input name="mistake" defaultValue={defaults?.mistake ?? ""} className="input" placeholder="Ошибка" />
      </div>
      <textarea name="note" defaultValue={defaults?.note ?? ""} className="input min-h-[70px]" placeholder="Заметка" />
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить сделку"}
      </button>
    </form>
  );
}
