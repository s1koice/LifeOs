export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured: allow (development convenience). In production, always set CRON_SECRET.
    return true;
  }
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

/** Returns true if `HH:MM` falls in the same hour as the cron tick (minute-agnostic). */
export function isSameHour(configuredTime: string, timezone: string): boolean {
  const [configuredHour] = configuredTime.split(":").map(Number);
  const nowHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
  return configuredHour === (nowHour === 24 ? 0 : nowHour);
}
