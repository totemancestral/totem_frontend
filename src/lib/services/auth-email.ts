import * as brevo from "@getbrevo/brevo";
import { getBrevoClient } from "@/lib/clients/brevo";

type Locale = "fr" | "en";
type AuthEmailType = "confirmation" | "magic" | "recovery";

export async function sendAuthEmail({
  email,
  actionLink,
  locale,
  type,
}: {
  email: string;
  actionLink: string;
  locale: Locale;
  type: AuthEmailType;
}) {
  const client = getBrevoClient();
  const message = new brevo.SendSmtpEmail();
  message.sender = {
    email: process.env.BREVO_AUTH_SENDER_EMAIL || "livraison@totem-ancestral.com",
    name: process.env.BREVO_SENDER_NAME || "TOTEM ANCESTRAL",
  };
  message.to = [{ email }];
  message.subject = subjectFor(type, locale);
  message.htmlContent = authHtml({ actionLink, locale, type });

  await client.sendTransacEmail(message);
}

function subjectFor(type: AuthEmailType, locale: Locale) {
  if (type === "confirmation") {
    return locale === "en"
      ? "Confirm your Totem Ancestral account"
      : "Confirmez votre compte Totem Ancestral";
  }

  if (type === "magic") {
    return locale === "en"
      ? "Your Totem Ancestral sign-in link"
      : "Votre lien de connexion Totem Ancestral";
  }

  return locale === "en"
    ? "Change your Totem Ancestral password"
    : "Changer votre mot de passe Totem Ancestral";
}

function authHtml({
  actionLink,
  locale,
  type,
}: {
  actionLink: string;
  locale: Locale;
  type: AuthEmailType;
}) {
  const copy = getCopy(type, locale);

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0c0e16;color:#e2e1ee;padding:32px;line-height:1.6">
      <div style="max-width:560px;margin:0 auto;border:1px solid rgba(216,173,77,.28);padding:28px;background:#12131b">
        <p style="letter-spacing:.22em;text-transform:uppercase;color:#d8ad4d;font-size:12px;margin:0 0 18px">TOTEM ANCESTRAL</p>
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 18px;color:#fff">${copy.title}</h1>
        <p>${copy.body}</p>
        <p style="margin:28px 0">
          <a href="${actionLink}" style="display:inline-block;background:#d8ad4d;color:#0c0e16;text-decoration:none;font-weight:700;padding:14px 20px;text-transform:uppercase;letter-spacing:.12em;font-size:12px">${copy.cta}</a>
        </p>
        <p style="color:#bab5a7;font-size:13px">${copy.foot}</p>
      </div>
    </div>
  `;
}

function getCopy(type: AuthEmailType, locale: Locale) {
  if (type === "confirmation") {
    return locale === "en"
      ? {
          title: "Confirm your account",
          body: "Your personal space is almost open. Confirm your email address to find your journey, orders and artworks.",
          cta: "Confirm my account",
          foot: "If you did not create a Totem Ancestral account, you can safely ignore this email.",
        }
      : {
          title: "Confirmez votre compte",
          body: "Votre espace personnel est presque ouvert. Confirmez votre adresse email pour retrouver votre parcours, vos commandes et vos oeuvres.",
          cta: "Confirmer mon compte",
          foot: "Si vous n'avez pas cree de compte Totem Ancestral, ignorez simplement cet email.",
        };
  }

  if (type === "magic") {
    return locale === "en"
      ? {
          title: "Your sign-in link",
          body: "Follow this secure link to reopen your Totem Ancestral space.",
          cta: "Sign in",
          foot: "If you did not request this link, you can safely ignore this email.",
        }
      : {
          title: "Votre lien de connexion",
          body: "Suivez ce lien securise pour rouvrir votre espace Totem Ancestral.",
          cta: "Me connecter",
          foot: "Si vous n'avez pas demande ce lien, vous pouvez ignorer cet email.",
        };
  }

  return locale === "en"
    ? {
        title: "Change your password",
        body: "We received a password reset request for your personal space.",
        cta: "Choose a new password",
        foot: "If you did not request this, you can safely ignore this email.",
      }
    : {
        title: "Changez votre mot de passe",
        body: "Nous avons recu une demande de changement de mot de passe pour votre espace personnel.",
        cta: "Choisir un nouveau mot de passe",
        foot: "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
      };
}
