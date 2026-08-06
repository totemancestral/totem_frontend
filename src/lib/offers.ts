/**
 * Source de vérité unique pour les offres TOTEM et leur correspondance avec
 * l'ENUM Supabase `offre_type` ('essentiel' | 'signature' | 'heritage').
 *
 * Deux vocabulaires coexistent dans le système :
 *  - UI / backend NestJS : origine | ancestral | famille | junior
 *  - Colonne `commandes.offre` (ENUM `offre_type`) : essentiel | signature | heritage
 *
 * Depuis la migration `20260720000000_add_junior_to_offre_type`, l'ENUM
 * `offre_type` comporte `junior` : une commande Junior est enregistrée avec
 * `offre = 'junior'` (constante `JUNIOR_COMMANDE_OFFRE`), et reste identifiable
 * par `montant_cents = JUNIOR_AMOUNT_CENTS`.
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

/** Prix Junior (offre hors ENUM), en centimes. */
export const JUNIOR_AMOUNT_CENTS = 999;

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
