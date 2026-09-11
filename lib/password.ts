// Règle de robustesse partagée entre le formulaire d'inscription, la
// réinitialisation de mot de passe, et la validation serveur (route
// /api/auth/signup) — une seule définition, jamais deux règles qui divergent.
export const PASSWORD_MIN_LENGTH = 8;

export function passwordRequirements(password: string) {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
  };
}

export function isStrongPassword(password: string): boolean {
  const req = passwordRequirements(password);
  return req.length && req.uppercase && req.lowercase && req.digit;
}
