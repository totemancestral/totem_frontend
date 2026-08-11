/**
 * Helpers partagés par les composants d'inscription et de connexion.
 * (SignupClient, SigninClient, ResetPasswordClient)
 */

export type Locale = "fr" | "en";

/** Chemin admin après connexion d'un compte avec role='admin'. */
export const ADMIN_PATH = "/fgh55_fh";

export function dashboardPath(locale: string): string {
  return `/${locale}/domus_animi`;
}

/**
 * Traduit un message d'erreur Supabase en français ou anglais.
 * Concentre toute la logique de mapping ici pour rester cohérent
 * entre les écrans signin/signup/reset.
 */
export function translateAuthError(error: unknown, locale: Locale): string {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();

  const dict = locale === "en"
    ? {
        invalid: "Incorrect email or password.",
        notFound: "Create an account first.",
        exists: "An account already exists with this email.",
        notConfirmed: "Please confirm your email address.",
        password: "Password must contain at least 6 characters.",
        email: "Check the email address.",
        rate: "Too many attempts. Please wait a moment and try again.",
        fallback: "Authentication failed.",
      }
    : {
        invalid: "Email ou mot de passe incorrect.",
        notFound: "Crée d'abord ton compte.",
        exists: "Un compte existe déjà avec cet email.",
        notConfirmed: "Confirme d'abord ton adresse email.",
        password: "Mot de passe trop court, minimum 6 caractères.",
        email: "Vérifie l'adresse email.",
        rate: "Trop de tentatives. Attends un moment avant de reessayer.",
        fallback: "Authentification impossible.",
      };

  if (lower.includes("invalid_credentials") || lower.includes("invalid login")) return dict.invalid;
  if (lower.includes("user_not_found")) return dict.notFound;
  if (lower.includes("already registered") || lower.includes("already exists")) return dict.exists;
  if (lower.includes("email not confirmed")) return dict.notConfirmed;
  if (lower.includes("password")) return dict.password;
  if (lower.includes("email")) return dict.email;
  if (lower.includes("rate limit")) return dict.rate;
  return message || dict.fallback;
}

/** Envoie un magic link via l'API interne. Renvoie null si OK, sinon le message d'erreur. */
export async function sendMagicLink(input: {
  email: string;
  locale: Locale;
  redirectPath: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: translateAuthError(new Error(data?.error ?? ""), input.locale) };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: translateAuthError(error, input.locale) };
  }
}
