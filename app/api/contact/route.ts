import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { escapeHtml, sendResendEmail } from "@/lib/resend";

const contactSchema = z.object({
  prenom: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  sujet: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 422 });
  }

  const { prenom, email, sujet, message } = parsed.data;
  const safeSubject = sujet.replace(/[\r\n]+/g, " ").trim();

  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return NextResponse.json({ error: "Service d'email non configuré" }, { status: 503 });
  }

  try {
    await sendResendEmail({
      to: { email: env.CONTACT_EMAIL || env.RESEND_FROM_EMAIL, name: "Totem Ancestral" },
      replyTo: { email, name: prenom },
      subject: `[Contact Totem] ${safeSubject}`,
      html: `
        <h3>Nouveau message depuis le formulaire contact</h3>
        <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(safeSubject)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
      text: `${prenom} <${email}>\n${safeSubject}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] Resend send failed:", error);
    return NextResponse.json({ error: "Envoi impossible pour le moment" }, { status: 502 });
  }
}
