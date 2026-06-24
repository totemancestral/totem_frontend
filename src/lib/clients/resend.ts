import { readEnvValue } from "@/lib/env-values";

type Recipient = { email: string; name?: string };

export type ResendEmail = {
  to: Recipient | Recipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: Recipient;
};

export async function sendResendEmail(email: ResendEmail): Promise<void> {
  const apiKey = readEnvValue("RESEND_API_KEY");
  if (!apiKey) return;

  const fromEmail = readEnvValue("RESEND_FROM_EMAIL");
  if (!fromEmail) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  const fromName = readEnvValue("RESEND_FROM_NAME") ?? "Totem Ancestral";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
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
