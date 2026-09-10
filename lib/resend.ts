import { getServerEnv } from "@/lib/env";

type Recipient = { email: string; name?: string };

export type ResendEmail = {
  to: Recipient | Recipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: Recipient;
};

export async function sendResendEmail(email: ResendEmail): Promise<void> {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!env.RESEND_FROM_EMAIL) throw new Error("Missing RESEND_FROM_EMAIL");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
      to: normalizeRecipients(email.to),
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.replyTo ? formatRecipient(email.replyTo) : undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`resend_failed:${response.status}:${detail.slice(0, 300)}`);
  }
}

function normalizeRecipients(to: Recipient | Recipient[]) {
  return (Array.isArray(to) ? to : [to]).map(formatRecipient);
}

function formatRecipient(recipient: Recipient) {
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
