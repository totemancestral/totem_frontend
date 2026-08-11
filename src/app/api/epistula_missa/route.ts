import { NextResponse } from "next/server";
import { z } from "zod";
import { sendResendEmail } from "@/lib/clients/resend";
import { readEnvValue } from "@/lib/env-values";
import { escapeHtml } from "@/lib/services/email";

const contactSchema = z.object({
  prenom: z.string().min(1),
  email: z.string().email(),
  sujet: z.string().min(1),
  message: z.string().min(10),
  consentement: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 422 });
  }

  const { prenom, email, sujet, message } = parsed.data;
  const safeSubject = sujet.replace(/[\r\n]+/g, " ").trim();

  try {
    if (!readEnvValue("RESEND_API_KEY")) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    await sendResendEmail({
      to: {
        email: readEnvValue("ADMIN_EMAIL") || "contact@totem-ancestral.com",
        name: "SENYCE Partners",
      },
      replyTo: { email, name: prenom },
      subject: `[Contact Totem] ${safeSubject}`,
      html: `
      <h3>Nouveau message depuis le formulaire contact</h3>
      <p><strong>Prenom :</strong> ${escapeHtml(prenom)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(sujet)}</p>
      <hr />
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    `,
      text: `${prenom} <${email}>\n${sujet}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur envoi email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
