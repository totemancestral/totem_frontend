import { describe, it, expect } from "vitest";
import {
  ADULT_OFFERS,
  JUNIOR_AMOUNT_CENTS,
  JUNIOR_COMMANDE_OFFRE,
  isAdultOffer,
  toCommandeOffre,
} from "../src/lib/offers";

describe("offers — mapping UI -> ENUM commandes.offre", () => {
  it("mappe les trois offres adultes vers les valeurs ENUM attendues", () => {
    expect(toCommandeOffre("origine")).toBe("essentiel");
    expect(toCommandeOffre("ancestral")).toBe("signature");
    expect(toCommandeOffre("famille")).toBe("heritage");
  });

  it("expose des montants cohérents (49 / 89 / 199 €)", () => {
    expect(ADULT_OFFERS.origine.amountCents).toBe(4900);
    expect(ADULT_OFFERS.ancestral.amountCents).toBe(8900);
    expect(ADULT_OFFERS.famille.amountCents).toBe(19900);
  });

  it("relie chaque offre à sa clé de prix Stripe", () => {
    expect(ADULT_OFFERS.origine.priceEnv).toBe("STRIPE_PRICE_ORIGINE");
    expect(ADULT_OFFERS.ancestral.priceEnv).toBe("STRIPE_PRICE_ANCESTRAL");
    expect(ADULT_OFFERS.famille.priceEnv).toBe("STRIPE_PRICE_FAMILLE");
  });
});

describe("offers — garde Junior (hors ENUM)", () => {
  it("isAdultOffer distingue les offres adultes de junior", () => {
    expect(isAdultOffer("origine")).toBe(true);
    expect(isAdultOffer("ancestral")).toBe(true);
    expect(isAdultOffer("famille")).toBe(true);
    expect(isAdultOffer("junior")).toBe(false);
  });

  it("Junior utilise le placeholder ENUM et son propre montant", () => {
    expect(JUNIOR_COMMANDE_OFFRE).toBe("essentiel");
    expect(JUNIOR_AMOUNT_CENTS).toBe(999);
  });
});
