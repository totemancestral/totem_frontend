import { NextResponse } from "next/server";
import { z } from "zod";
import { getBrevoClient } from "@/lib/clients/brevo";
import * as brevo from "@getbrevo/brevo";

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

  try {
    const brevoClient = getBrevoClient();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: process.env.ADMIN_EMAIL || "contact@totemancestral.com", name: "SENYCE Partners" }];
    sendSmtpEmail.replyTo = { email, name: prenom };
    sendSmtpEmail.subject = `[Contact Totem] ${sujet}`;
    sendSmtpEmail.htmlContent = `
      <h3>Nouveau message depuis le formulaire contact</h3>
      <p><strong>Prénom :</strong> ${prenom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${sujet}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    await brevoClient.sendTransacEmail(sendSmtpEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur envoi email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
