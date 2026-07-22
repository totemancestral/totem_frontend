/**
 * Informations légales de l'éditeur — source unique.
 *
 * ⚠️ Les valeurs marquées « [À COMPLÉTER …] » doivent être renseignées avec
 * les informations réelles de la société (extrait Kbis). Une fois remplies
 * ici, elles se propagent aux Mentions légales, CGV et Confidentialité.
 */
export const LEGAL = {
  /** Raison sociale. */
  company: "SENYCE PARTNERS",
  /** Forme juridique. */
  form: "SARL",
  /** Capital social. */
  capital: "[À COMPLÉTER : capital social]",
  /** Numéro RCS (ville + numéro) ou SIREN. */
  rcs: "[À COMPLÉTER : RCS Paris n° / SIREN]",
  /** Numéro de TVA intracommunautaire. */
  tva: "[À COMPLÉTER : n° TVA intracommunautaire]",
  /** Adresse du siège (rue + code postal). */
  street: "[À COMPLÉTER : n° et rue]",
  /** Ville / pays du siège. */
  city: "Paris, France",
  /** Email de contact public. */
  email: "contact@totem-ancestral.com",
  /** Directeur / directrice de la publication. */
  director: "[À COMPLÉTER : directeur de la publication]",
  /** Médiateur de la consommation (obligatoire B2C). */
  mediator: "[À COMPLÉTER : nom + site du médiateur de la consommation]",
  /** Nom commercial du service. */
  brand: "Totem Ancestral",
  /** Domaine principal. */
  domain: "totem-ancestral.com",
  /** Date de dernière mise à jour affichée sur les pages légales. */
  updated: "22 juillet 2026",
} as const;

/** Adresse complète du siège, sur une ligne. */
export function legalAddress(): string {
  return `${LEGAL.street}, ${LEGAL.city}`;
}
