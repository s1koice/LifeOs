import { daysAgoKey, toDateKey, todayKey } from "@/lib/date";

export function computeStreak(completedDateKeys: Set<string>): number {
  let streak = 0;
  const today = todayKey();
  let cursor = 0;

  // If today isn't checked off yet, start counting from yesterday
  // so an unmarked "today" doesn't reset an otherwise live streak.
  if (!completedDateKeys.has(today)) {
    cursor = 1;
  }

  while (completedDateKeys.has(daysAgoKey(cursor))) {
    streak++;
    cursor++;
  }

  return streak;
}

export function computePercent(
  completedDateKeys: Set<string>,
  windowDays: number
): number {
  let count = 0;
  for (let i = 0; i < windowDays; i++) {
    if (completedDateKeys.has(daysAgoKey(i))) count++;
  }
  return Math.round((count / windowDays) * 100);
}

export { toDateKey };
