import { Resend } from "resend";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendDigestEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "LifeOS <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject,
    text,
    html: `<pre style="font-family: -apple-system, sans-serif; white-space: pre-wrap;">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  });
}
