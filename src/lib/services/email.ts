import { sendResendEmail } from "@/lib/clients/resend";
import { readEnvValue } from "@/lib/env-values";

export type EmailLocale = "fr" | "en";

type SendParams = {
  to: { email: string; name: string };
  subject: string;
  html: string;
  text?: string;
};

async function sendTransactional(params: SendParams): Promise<void> {
  const apiKey = readEnvValue("RESEND_API_KEY");
  if (!apiKey) return;

  await sendResendEmail(params);
}

export async function sendConfirmationEmail(
  email: string,
  prenom: string,
  offre: string,
  locale: EmailLocale,
  commandeId: string,
): Promise<void> {
  const copy = confirmationCopy(locale, prenom, offre, commandeId);

  await sendTransactional({
    to: { email, name: prenom },
    subject: copy.subject,
    html: layoutEmail(copy.title, copy.body),
    text: copy.text,
  });
}

export async function sendDeliveryEmail(
  email: string,
  prenom: string,
  locale: EmailLocale,
  assets: { imageUrl?: string; audioUrl?: string; pdfUrl?: string; nomTotem?: string },
): Promise<void> {
  const copy = deliveryCopy(locale, prenom, assets);

  await sendTransactional({
    to: { email, name: prenom },
    subject: copy.subject,
    html: layoutEmail(copy.title, copy.body, copy.cta, copy.links),
    text: copy.text,
  });
}

export async function sendAdminAlert(sujet: string, details: string): Promise<void> {
  const adminEmail = readEnvValue("ADMIN_EMAIL");

  if (!adminEmail) return;

  await sendTransactional({
    to: { email: adminEmail, name: "Admin SENYCE" },
    subject: `[Totem] ${sujet}`,
    html: layoutEmail("Alerte Totem", `<p>${escapeHtml(details)}</p>`),
    text: details,
  });
}

type EmailLink = { label: string; url: string };

function confirmationCopy(locale: EmailLocale, prenom: string, offre: string, commandeId: string) {
  const name = escapeHtml(prenom || (locale === "fr" ? "Voyageur" : "Traveler"));
  const offer = escapeHtml(offre);
  const order = escapeHtml(commandeId);

  if (locale === "en") {
    return {
      subject: "Your Totem Ancestral order is confirmed",
      title: "Order confirmed",
      body: `<p>${name}, your ${offer} order has been registered.</p><p>Order reference: <strong>${order}</strong>.</p><p>Your composition will begin once your journey is complete.</p>`,
      text: `${prenom}, your ${offre} order has been registered. Order reference: ${commandeId}.`,
    };
  }

  return {
    subject: "Votre commande Totem Ancestral est confirmee",
    title: "Commande confirmee",
    body: `<p>${name}, votre commande ${offer} est bien enregistree.</p><p>Reference commande : <strong>${order}</strong>.</p><p>La composition commencera lorsque votre parcours sera complet.</p>`,
    text: `${prenom}, votre commande ${offre} est bien enregistree. Reference commande : ${commandeId}.`,
  };
}

function deliveryCopy(
  locale: EmailLocale,
  prenom: string,
  assets: { imageUrl?: string; audioUrl?: string; pdfUrl?: string; nomTotem?: string },
) {
  const name = escapeHtml(prenom || (locale === "fr" ? "Voyageur" : "Traveler"));
  const totem = escapeHtml(assets.nomTotem ?? "Totem Ancestral");
  const links = [
    assets.imageUrl ? { label: locale === "fr" ? "Image" : "Image", url: assets.imageUrl } : null,
    assets.audioUrl ? { label: locale === "fr" ? "Audio" : "Audio", url: assets.audioUrl } : null,
    assets.pdfUrl
      ? { label: locale === "fr" ? "Parchemin PDF" : "PDF parchment", url: assets.pdfUrl }
      : null,
  ].filter((link): link is EmailLink => Boolean(link));

  if (locale === "en") {
    return {
      subject: "Your Totem Ancestral artwork is ready",
      title: "Your artwork is ready",
      body: `<p>${name}, your digital box is ready.</p><p>Ancestral name: <strong>${totem}</strong>.</p>`,
      cta: assets.pdfUrl ? { label: "Open the parchment", url: assets.pdfUrl } : undefined,
      links,
      text: `${prenom}, your digital box is ready. ${assets.pdfUrl ?? ""}`,
    };
  }

  return {
    subject: "Votre oeuvre Totem Ancestral est prete",
    title: "Votre oeuvre est prete",
    body: `<p>${name}, votre coffret numerique est pret.</p><p>Nom ancestral : <strong>${totem}</strong>.</p>`,
    cta: assets.pdfUrl ? { label: "Ouvrir le parchemin", url: assets.pdfUrl } : undefined,
    links,
    text: `${prenom}, votre coffret numerique est pret. ${assets.pdfUrl ?? ""}`,
  };
}

function layoutEmail(title: string, body: string, cta?: EmailLink, links: EmailLink[] = []) {
  const linksHtml = links.length
    ? `<div style="margin-top:24px">${links
        .map(
          (link) =>
            `<p style="margin:8px 0"><a href="${escapeAttribute(link.url)}" style="color:#d8ad4d">${escapeHtml(link.label)}</a></p>`,
        )
        .join("")}</div>`
    : "";
  const ctaHtml = cta
    ? `<p style="margin:28px 0"><a href="${escapeAttribute(cta.url)}" style="display:inline-block;background:#d8ad4d;color:#0c0e16;text-decoration:none;font-weight:700;padding:14px 20px;text-transform:uppercase;letter-spacing:.12em;font-size:12px">${escapeHtml(cta.label)}</a></p>`
    : "";

  return `<div style="font-family:Inter,Arial,sans-serif;background:#0c0e16;color:#e2e1ee;padding:32px;line-height:1.6"><div style="max-width:560px;margin:0 auto;border:1px solid rgba(216,173,77,.28);padding:28px;background:#12131b"><p style="letter-spacing:.22em;text-transform:uppercase;color:#d8ad4d;font-size:12px;margin:0 0 18px">TOTEM ANCESTRAL</p><h1 style="font-size:28px;line-height:1.1;margin:0 0 18px;color:#fff">${escapeHtml(title)}</h1>${body}${ctaHtml}${linksHtml}<p style="color:#bab5a7;font-size:13px;margin-top:28px">SENYCE PARTNERS</p></div></div>`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
