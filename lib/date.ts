/**
 * All day-key helpers take an optional IANA timezone so a user's calendar day
 * (habit check-ins, streaks, daily review dedupe) lines up with their local
 * midnight instead of the server's UTC day.
 */
export function toDateKey(date: Date, timezone?: string): string {
  if (!timezone) return date.toISOString().slice(0, 10);
  // en-CA formats as YYYY-MM-DD, which matches the key format used everywhere else.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayKey(timezone?: string): string {
  return toDateKey(new Date(), timezone);
}

export function daysAgoKey(days: number, timezone?: string): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateKey(d, timezone);
}

export function lastNDayKeys(n: number, timezone?: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < n; i++) {
    keys.push(daysAgoKey(i, timezone));
  }
  return keys;
}
