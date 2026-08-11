/**
 * Informations légales de l'éditeur — source unique.
 *
 * Source unique : ces valeurs alimentent le pied de page, les Mentions
 * légales, les CGV et la page Confidentialité.
 */
export const LEGAL = {
  /** Raison sociale. */
  company: "SENYCE PARTNERS",
  /** Forme juridique. */
  form: "SARL",
  /** Capital social. */
  capital: "19 000 €",
  /** Numéro RCS (ville + numéro) ou SIREN. */
  rcs: "833 978 554 R.C.S. Nanterre",
  /** Numéro de TVA intracommunautaire. */
  tva: "FR27833978554",
  /** Adresse du siège (rue + code postal). */
  street: "4 avenue Laurent Cely",
  /** Ville / pays du siège. */
  city: "92600 Asnières-sur-Seine, France",
  /** Email de contact public. */
  email: "contact@totem-ancestral.com",
  /** Directeur / directrice de la publication. */
  director: "AGOSSOU Adimagbolo",
  /** Médiateur de la consommation (obligatoire B2C). */
  mediator: "CM2C — Centre de la Médiation de la Consommation de Conciliateurs de Justice",
  /** Site de saisine du médiateur. */
  mediatorUrl: "https://cm2c.net",
  /** Adresse postale du médiateur. */
  mediatorAddress: "14 rue Saint-Jean, 75017 Paris",
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
