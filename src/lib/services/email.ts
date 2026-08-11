import { sendResendEmail } from "@/lib/clients/resend";
import { readEnvValue } from "@/lib/env-values";
import { LEGAL } from "@/lib/legal";

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
    to: { email: adminEmail, name: "Admin Totem Ancestral" },
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

function siteUrl() {
  return (readEnvValue("NEXT_PUBLIC_SITE_URL") || `https://${LEGAL.domain}`).replace(/\/$/, "");
}

/**
 * Gabarit HTML transactionnel — compatible clients mail (tables, styles
 * inline). Palette TOTEM (nuit profonde + or ancestral). Entête wordmark,
 * filet doré, bouton CTA optionnel, liste de liens, pied de page légal.
 */
function layoutEmail(title: string, body: string, cta?: EmailLink, links: EmailLink[] = []) {
  const site = siteUrl();

  const ctaHtml = cta
    ? `<tr><td style="padding:10px 0 4px"><a href="${escapeAttribute(cta.url)}" style="display:inline-block;background:#d8ad4d;background:linear-gradient(135deg,#eacb63,#d8ad4d);color:#0c0e16;text-decoration:none;font-weight:700;padding:15px 30px;border-radius:999px;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-family:Arial,Helvetica,sans-serif">${escapeHtml(cta.label)}</a></td></tr>`
    : "";

  const linksHtml = links.length
    ? `<tr><td style="padding:20px 0 0">${links
        .map(
          (link) =>
            `<a href="${escapeAttribute(link.url)}" style="display:inline-block;margin:0 16px 10px 0;color:#f6c865;text-decoration:none;font-size:13px;border-bottom:1px solid rgba(246,200,101,.4);padding-bottom:2px">${escapeHtml(link.label)} &rarr;</a>`,
        )
        .join("")}</td></tr>`
    : "";

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#0a0b12;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(title)} — ${LEGAL.brand}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b12;padding:36px 16px">
  <tr><td align="center">
    <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#16121b;background:linear-gradient(160deg,#1a1c27 0%,#131420 55%,#0e0f17 100%);border:1px solid rgba(216,173,77,.34);border-radius:22px;overflow:hidden;box-shadow:0 24px 60px -30px rgba(216,173,77,.4)">
      <tr><td style="height:3px;line-height:3px;font-size:0;background:linear-gradient(90deg,transparent,rgba(216,173,77,.85),transparent)">&nbsp;</td></tr>
      <tr><td style="padding:30px 36px 0">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td valign="middle"><img src="${site}/assets/totem-logo.png" width="42" height="42" alt="" style="display:block;border:0;outline:none"></td>
          <td valign="middle" style="padding-left:13px;font-family:Arial,Helvetica,sans-serif">
            <div style="letter-spacing:.26em;text-transform:uppercase;color:#d8ad4d;font-size:13px;font-weight:700">TOTEM ANCESTRAL</div>
            <div style="letter-spacing:.14em;text-transform:uppercase;color:#8a8677;font-size:10px;margin-top:3px">${escapeHtml(LEGAL.company)}</div>
          </td>
        </tr></table>
        <div style="height:1px;background:linear-gradient(90deg,rgba(216,173,77,.6),transparent);margin:22px 0 22px"></div>
        <h1 style="font-size:27px;line-height:1.18;margin:0 0 16px;color:#ffffff;font-family:Georgia,'Times New Roman',serif">${escapeHtml(title)}</h1>
      </td></tr>
      <tr><td style="padding:0 36px 6px;color:#e2e1ee;font-size:15px;line-height:1.66;font-family:Arial,Helvetica,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${body}</td></tr>${ctaHtml}${linksHtml}</table>
      </td></tr>
      <tr><td style="padding:26px 36px 32px">
        <div style="height:1px;background:rgba(216,173,77,.18);margin:20px 0 16px"></div>
        <p style="margin:0 0 6px;color:#bab5a7;font-size:12px;font-family:Arial,Helvetica,sans-serif">${escapeHtml(LEGAL.company)} — ${escapeHtml(LEGAL.brand)}</p>
        <p style="margin:0;color:#8a8677;font-size:12px;font-family:Arial,Helvetica,sans-serif">
          <a href="${site}" style="color:#8a8677;text-decoration:underline">Site</a> ·
          <a href="${site}/fr/lex_mercatoria" style="color:#8a8677;text-decoration:underline">CGV</a> ·
          <a href="${site}/fr/arcanum_privata" style="color:#8a8677;text-decoration:underline">Confidentialité</a> ·
          <a href="mailto:${LEGAL.email}" style="color:#8a8677;text-decoration:underline">${LEGAL.email}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
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
