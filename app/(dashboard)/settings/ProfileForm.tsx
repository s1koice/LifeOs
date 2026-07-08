"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/settings";

type UserData = {
  name: string | null;
  timezone: string;
  morningCheckinTime: string;
  eveningCheckinTime: string;
};

const COMMON_TZ = [
  "Asia/Jerusalem",
  "Europe/Moscow",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
];

export function ProfileForm({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateProfile(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-3">
      <div>
        <label className="label mb-1 block">Имя</label>
        <input name="name" required defaultValue={user.name ?? ""} className="input" />
      </div>
      <div>
        <label className="label mb-1 block">Часовой пояс</label>
        <select name="timezone" defaultValue={user.timezone} className="input">
          {COMMON_TZ.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label mb-1 block">Утренний чекин</label>
          <input
            name="morningCheckinTime"
            type="time"
            defaultValue={user.morningCheckinTime}
            className="input"
          />
        </div>
        <div>
          <label className="label mb-1 block">Вечерний чекин</label>
          <input
            name="eveningCheckinTime"
            type="time"
            defaultValue={user.eveningCheckinTime}
            className="input"
          />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохранение..." : "Сохранить"}
      </button>
      {saved && <p className="text-sm text-accent-green">Сохранено</p>}
    </form>
  );
}
