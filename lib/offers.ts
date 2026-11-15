import { interfaceCopy } from "@/lib/interface-copy";

/**
 * Source de vérité unique du catalogue (prix + mapping ENUM) côté frontend.
 *
 * Deux vocabulaires coexistent :
 *  - Catalogue actif : origine | ancestral | junior
 *  - Colonne `commandes.offre` (ENUM `offre_type`) : essentiel | signature | heritage
 *
 * Grille : Origine 29 €, Révélation/Ancestral 49 €, Junior 9,99 €.
 * Doit rester identique à `totem_backend/src/totem/prices.ts`.
 */

export const ADULT_OFFER_IDS = ["origine", "ancestral"] as const;
export type AdultOffer = typeof ADULT_OFFER_IDS[number];
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
    amountCents: 2900,
    commandeOffre: "essentiel",
    label: "TOTEM ANCESTRAL - Origine",
  },
  ancestral: {
    amountCents: 4900,
    commandeOffre: "signature",
    label: "TOTEM ANCESTRAL - Revelation",
  },
};

/** Libellé produit Stripe pour l'offre Junior. */
export const JUNIOR_LABEL = "TOTEM JUNIOR";

/** Prix Junior, en centimes. */
export const JUNIOR_AMOUNT_CENTS = 999;

export function formatEuro(amountCents: number, lang: "fr" | "en" = "fr"): string {
  const euros = amountCents / 100;
  if (lang === "en") return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(euros) ? 0 : 2 }).format(euros);
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
export function isAdultOffer(offer: string | null): offer is AdultOffer {
  return offer === "origine" || offer === "ancestral";
}

/** Libellé lisible d'une valeur ENUM `commandes.offre`. */
export function offreLabel(offre: OffreType, lang: "fr" | "en" = "fr"): string {
  return interfaceCopy(lang).offers[offre] ?? offre;
}
