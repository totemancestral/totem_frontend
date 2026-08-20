/**
 * Source de vérité unique du catalogue (prix + mapping ENUM) côté frontend.
 *
 * Deux vocabulaires coexistent :
 *  - UI / backend NestJS : origine | ancestral | famille | junior
 *  - Colonne `commandes.offre` (ENUM `offre_type`) : essentiel | signature | heritage
 *
 * Grille (brief 2026-08-06) : Origine 49 €, Révélation/Ancestral 99 €,
 * Famille 219 € (barre 297 €), Junior 9,99 €. Doit rester identique à
 * `totem_backend/src/totem/prices.ts`.
 *
 * Depuis la migration `20260720000000_add_junior_to_offre_type`, l'ENUM
 * `offre_type` comporte `junior`.
 */

export type AdultOffer = "origine" | "ancestral" | "famille";
export type Offer = AdultOffer | "junior";
export type OffreType =
  | "essentiel"
  | "signature"
  | "heritage"
  | "origine"
  | "ancestral"
  | "famille"
  | "junior";

type AdultOfferConfig = {
  amountCents: number;
  commandeOffre: OffreType;
  /** Libellé produit envoyé à Stripe via `price_data` (pas de price_id à créer). */
  label: string;
};

export const ADULT_OFFERS: Record<AdultOffer, AdultOfferConfig> = {
  origine: {
    amountCents: 4900,
    commandeOffre: "essentiel",
    label: "TOTEM ANCESTRAL - Origine",
  },
  ancestral: {
    amountCents: 9900,
    commandeOffre: "signature",
    label: "TOTEM ANCESTRAL - Revelation",
  },
  famille: {
    amountCents: 21900,
    commandeOffre: "heritage",
    label: "TOTEM ANCESTRAL - Famille",
  },
};

/** Libellé produit Stripe pour l'offre Junior. */
export const JUNIOR_LABEL = "TOTEM JUNIOR";

/** Prix Junior, en centimes. */
export const JUNIOR_AMOUNT_CENTS = 999;

/** Prix barré Famille (3 × Révélation), en centimes — ancrage marketing. */
export const FAMILLE_COMPARE_AT_CENTS = 29700;

export function formatEuro(amountCents: number): string {
  const euros = amountCents / 100;
  if (Number.isInteger(euros)) return `${euros}€`;
  return `${euros.toFixed(2).replace(".", ",")} €`;
}

/** Valeur ENUM `offre_type` pour une commande Junior. */
export const JUNIOR_COMMANDE_OFFRE: OffreType = "junior";

/** Convertit une offre adulte (UI) vers la valeur ENUM `commandes.offre`. */
export function toCommandeOffre(offer: AdultOffer): OffreType {
  return ADULT_OFFERS[offer].commandeOffre;
}

/** Garde de type : vrai pour les offres adultes (présentes dans l'ENUM). */
export function isAdultOffer(offer: Offer): offer is AdultOffer {
  return offer === "origine" || offer === "ancestral" || offer === "famille";
}
