import fr from "@/app/[lang]/dictionaries/interface.fr.json";
import en from "@/app/[lang]/dictionaries/interface.en.json";

export function interfaceCopy(lang: string) { return lang === "en" ? en : fr; }
export function formatInterface(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder));
}
export class InterfaceError extends Error {
  constructor(readonly key: keyof typeof fr.errors) { super(key); }
}

/** Translate known Auth codes; never show a raw server/SDK error to users. */
export function authErrorMessage(error: unknown, lang: string, fallback: keyof typeof fr.errors): string {
  const copy = interfaceCopy(lang).errors;
  if (error instanceof InterfaceError) return copy[error.key];
  const details = error && typeof error === "object" ? error as { code?: unknown; message?: unknown; status?: unknown } : {};
  const code = typeof details.code === "string" ? details.code : "";
  const message = typeof details.message === "string" ? details.message : "";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return copy.invalidCredentials;
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return copy.emailUnconfirmed;
  if (details.status === 429 || code.startsWith("over_") || /rate limit/i.test(message)) return copy.tooManyRequests;
  if (code === "weak_password") return copy.passwordRules;
  if (code === "same_password") return copy.passwordReuse;
  if (["email_exists", "user_already_exists"].includes(code)) return copy.emailUnavailable;
  if (["email_address_invalid", "validation_failed"].includes(code)) return copy.invalidEmail;
  if (["session_not_found", "refresh_token_not_found", "refresh_token_already_used"].includes(code)) return copy.sessionExpired;
  return copy[fallback];
}
