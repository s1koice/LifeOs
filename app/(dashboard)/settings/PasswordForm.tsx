"use client";

import { useRef, useState, useTransition } from "react";
import { updatePassword } from "@/lib/actions/settings";

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updatePassword(formData);
        setMessage({ type: "ok", text: "Пароль обновлён" });
        formRef.current?.reset();
      } catch (e) {
        setMessage({ type: "error", text: e instanceof Error ? e.message : "Ошибка" });
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3">
      <div>
        <label className="label mb-1 block">Текущий пароль</label>
        <input name="currentPassword" type="password" required className="input" />
      </div>
      <div>
        <label className="label mb-1 block">Новый пароль</label>
        <input name="newPassword" type="password" required minLength={8} className="input" />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : "Сменить пароль"}
      </button>
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-accent-green" : "text-accent-red"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
