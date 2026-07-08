export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // Never let this public, unauthenticated route run in production
      // without a secret — that would let anyone trigger AI sends for
      // every user by hitting the URL.
      return false;
    }
    // No secret configured in development: allow, for local convenience.
    return true;
  }
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

/**
 * A check-in is "due" once local time has passed the configured HH:MM and is
 * still within a grace window after it. The grace window absorbs a cron tick
 * that fires a few minutes late, a missed/throttled invocation, or a DST
 * transition that shifts the wall clock — the actual once-per-day guarantee
 * comes from the DailyReview unique constraint, not from this check.
 */
export function isCheckinDue(
  configuredTime: string,
  timezone: string,
  graceMinutes = 180
): boolean {
  const [hour, minute] = configuredTime.split(":").map(Number);
  const configuredMinutes = hour * 60 + minute;

  const nowParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const nowHour = Number(nowParts.find((p) => p.type === "hour")?.value ?? "0");
  const nowMinute = Number(nowParts.find((p) => p.type === "minute")?.value ?? "0");
  const nowMinutes = nowHour * 60 + nowMinute;

  return nowMinutes >= configuredMinutes && nowMinutes < configuredMinutes + graceMinutes;
}
