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

  it("expose un libellé produit pour Stripe price_data (pas de price_id)", () => {
    expect(ADULT_OFFERS.origine.label).toBe("TOTEM ANCESTRAL - Origine");
    expect(ADULT_OFFERS.ancestral.label).toBe("TOTEM ANCESTRAL - Ancestral");
    expect(ADULT_OFFERS.famille.label).toBe("TOTEM ANCESTRAL - Famille");
  });
});

describe("offers — garde Junior (hors ENUM)", () => {
  it("isAdultOffer distingue les offres adultes de junior", () => {
    expect(isAdultOffer("origine")).toBe(true);
    expect(isAdultOffer("ancestral")).toBe(true);
    expect(isAdultOffer("famille")).toBe(true);
    expect(isAdultOffer("junior")).toBe(false);
  });

  it("Junior a sa propre valeur ENUM et son montant dédié", () => {
    expect(JUNIOR_COMMANDE_OFFRE).toBe("junior");
    expect(JUNIOR_AMOUNT_CENTS).toBe(999);
  });
});
