import { describe, expect, it } from "vitest";
import { ADULT_OFFERS, JUNIOR_AMOUNT_CENTS, formatEuro } from "@/lib/offers";
import fr from "@/app/[lang]/dictionaries/fr.json";
import en from "@/app/[lang]/dictionaries/en.json";
import { TOTEM_PRICES_CENTS } from "../../totem_backend/src/totem/prices";

describe("adult prices displayed and charged", () => {
  it("keeps the frontend and backend cent amounts identical", () => {
    expect(ADULT_OFFERS.origine.amountCents).toBe(2972);
    expect(ADULT_OFFERS.ancestral.amountCents).toBe(3840);
    for (const offer of ["origine", "ancestral"] as const) {
      expect(ADULT_OFFERS[offer].amountCents).toBe(TOTEM_PRICES_CENTS[offer]);
    }
    expect(JUNIOR_AMOUNT_CENTS).toBe(999);
  });
  it.each([[fr, "29,72 €", "38,40 €"], [en, "€29.72", "€38.40"]] as const)("uses the current prices across cards, comparison and payment", (dict, origine, revelation) => {
    expect(dict.offres.items[0].price).toBe(origine);
    expect(dict.offres.items[1].price).toBe(revelation);
    expect(dict.offresComparatif.columns.map(column => column.price)).toEqual([origine, revelation]);
    expect(dict.paiement.adulte.price).toBe(revelation);
    expect(dict.seo.offres.description).toContain(origine);
    expect(dict.seo.offres.description).toContain(revelation);
  });
  it("preserves the fractional cents in monetary formatting", () => {
    expect(formatEuro(2972, "fr")).toBe("29,72 €");
    expect(formatEuro(3840, "en")).toBe("€38.40");
  });
});
