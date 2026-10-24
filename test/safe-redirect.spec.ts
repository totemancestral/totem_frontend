import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

describe("authentication continuations", () => {
  it.each([
    null, undefined, "", "https://evil.invalid", "//evil.invalid", "/\\evil.invalid",
    "javascript:alert(1)", " /fr/espace", "/fr/\n/espace", "/en/espace",
    "/fr/../../evil", "/fr/%2e%2e/../evil", "/fr/%2f%2fevil.invalid",
    "/fr/%5cevil", "/fr/%252f%252fevil", "/fr/%00espace",
  ])("rejects unsafe destination %s", (value) => {
    expect(safeRedirectPath(value, "fr")).toBe("/fr/parcours");
  });

  it.each([
    "/fr/espace", "/fr/parcours?offre=heritage", "/fr/parcours-junior",
    "/fr/paiement?session_id=cs_test#retour", "/fr/parcours?value=a%2Fb",
  ])("preserves internal continuation %s", (value) => {
    expect(safeRedirectPath(value, "fr")).toBe(value);
  });

  it("uses the English fallback and preserves English continuations", () => {
    expect(safeRedirectPath("//evil.invalid", "en")).toBe("/en/parcours");
    expect(safeRedirectPath("/en/parcours?offre=heritage", "en")).toBe("/en/parcours?offre=heritage");
  });
});
