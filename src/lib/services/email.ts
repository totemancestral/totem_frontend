import { getBrevoClient } from "@/lib/clients/brevo";
import * as brevo from "@getbrevo/brevo";

export type EmailLocale = "fr" | "en";

type SendParams = {
  to: { email: string; name: string };
  templateId: number;
  params: Record<string, string>;
};

async function sendTransactional(params: SendParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const client = getBrevoClient();
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.to = [params.to];
  sendSmtpEmail.templateId = params.templateId;
  sendSmtpEmail.params = params.params;

  await client.sendTransacEmail(sendSmtpEmail);
}

export async function sendConfirmationEmail(
  email: string,
  prenom: string,
  offre: string,
  locale: EmailLocale,
  commandeId: string,
): Promise<void> {
  const templateId =
    locale === "fr"
      ? Number(process.env.BREVO_TEMPLATE_CONFIRM_FR)
      : Number(process.env.BREVO_TEMPLATE_CONFIRM_EN);

  if (!templateId) return;

  await sendTransactional({
    to: { email, name: prenom },
    templateId,
    params: { PRENOM: prenom, OFFRE: offre, COMMANDE_ID: commandeId },
  });
}

export async function sendDeliveryEmail(
  email: string,
  prenom: string,
  locale: EmailLocale,
  assets: { imageUrl?: string; audioUrl?: string; pdfUrl?: string; nomTotem?: string },
): Promise<void> {
  const templateId =
    locale === "fr"
      ? Number(process.env.BREVO_TEMPLATE_LIVRAISON_FR)
      : Number(process.env.BREVO_TEMPLATE_LIVRAISON_EN);

  if (!templateId) return;

  await sendTransactional({
    to: { email, name: prenom },
    templateId,
    params: {
      PRENOM: prenom,
      NOM_TOTEM: assets.nomTotem ?? "",
      IMAGE_URL: assets.imageUrl ?? "",
      AUDIO_URL: assets.audioUrl ?? "",
      PDF_URL: assets.pdfUrl ?? "",
    },
  });
}

export async function sendAdminAlert(sujet: string, details: string): Promise<void> {
  const templateId = Number(process.env.BREVO_TEMPLATE_ALERTE_ADMIN);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!templateId || !adminEmail) return;

  await sendTransactional({
    to: { email: adminEmail, name: "Admin SENYCE" },
    templateId,
    params: { SUJET: sujet, DETAILS: details },
  });
}
