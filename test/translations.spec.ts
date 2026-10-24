import { describe, expect, it } from "vitest";
import fr from "@/app/[lang]/dictionaries/fr.json";
import en from "@/app/[lang]/dictionaries/en.json";
import uiFr from "@/app/[lang]/dictionaries/interface.fr.json";
import uiEn from "@/app/[lang]/dictionaries/interface.en.json";
import adminFr from "@/app/[lang]/dictionaries/admin.fr.json";
import adminEn from "@/app/[lang]/dictionaries/admin.en.json";
import { adminText, adminStatus, adminLoadError, adminOffer } from "@/lib/admin-copy";
import { authErrorMessage, formatInterface, InterfaceError } from "@/lib/interface-copy";
import { formatEuro, offreLabel } from "@/lib/offers";

function leaves(value: unknown, prefix = ""): Record<string, unknown> {
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key))));
  return { [prefix]: value };
}
describe("French and English translations", () => {
  it.each([["pages", fr, en], ["interface", uiFr, uiEn], ["administration", adminFr, adminEn]] as const)("keeps all %s keys, array entries and placeholders aligned", (_, french, english) => {
    const a = leaves(french), b = leaves(english);
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
    for (const key of Object.keys(a)) {
      expect(typeof b[key], key).toBe(typeof a[key]);
      if (typeof a[key] === "string") {
        const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
        expect(parameters(String(b[key])), key).toEqual(parameters(String(a[key])));
      }
    }
  });
  it("translates administration states, offers, MFA errors and dynamic announcements", () => {
    expect(adminStatus("en", "en_attente_paiement")).toBe("Awaiting payment");
    expect(adminStatus("fr", "livree")).toBe("Livrée");
    expect(adminStatus("en", "unknown_code")).toBe("unknown_code");
    expect(adminOffer("en", "signature")).toBe("Revelation");
    expect(adminOffer("fr", "signature")).toBe("Révélation");
    expect(adminOffer("en", "unknown_offer")).toBe("unknown_offer");
    expect(adminText("en", "Code invalide, réessaie.")).toBe("Invalid code. Please try again.");
    expect(adminText("en", "Relance lancée sur {count} commande(s).", { count: 3 })).toBe("Retry started for 3 order(s).");
    expect(adminText("en", "{file} : manquant", { file: "PDF" })).toBe("PDF: missing");
    expect(adminLoadError("en", 401)).toBe("Your session has expired. Please sign in again.");
    expect(adminLoadError("en", 403)).toBe("Access denied.");
    expect(adminLoadError("en", 500)).toBe("Unable to load this information.");
  });
  it.each([
    [{ code: "invalid_credentials" }, "invalidCredentials"],
    [{ message: "Invalid login credentials" }, "invalidCredentials"],
    [{ code: "email_not_confirmed" }, "emailUnconfirmed"],
    [{ status: 429 }, "tooManyRequests"],
    [{ code: "weak_password" }, "passwordRules"],
    [{ code: "same_password" }, "passwordReuse"],
    [{ code: "email_exists" }, "emailUnavailable"],
  ] as const)("translates known authentication error %s", (error, key) => {
    expect(authErrorMessage(error, "en", "signInFailed")).toBe(uiEn.errors[key]);
    expect(authErrorMessage(error, "fr", "signInFailed")).toBe(uiFr.errors[key]);
  });
  it("uses a localized fallback instead of leaking a raw technical or French error", () => {
    expect(authErrorMessage(new Error("Erreur technique interne avec des données privées"), "en", "updateFailed")).toBe(uiEn.errors.updateFailed);
    expect(authErrorMessage(new InterfaceError("sessionExpired"), "en", "updateFailed")).toBe(uiEn.errors.sessionExpired);
  });
  it("formats artwork details, labels and prices in the selected language", () => {
    expect(formatInterface(uiEn.artwork.orderInfo, { number: "TEST", date: "23 October 2026" })).toBe("Artwork no. TEST · Delivered on 23 October 2026");
    expect(offreLabel("signature", "en")).toBe("Revelation");
    expect(offreLabel("signature", "fr")).toBe("Révélation");
    expect(formatEuro(999, "en")).toBe("€9.99");
    expect(formatEuro(999, "fr")).toBe("9,99 €");
  });
});
