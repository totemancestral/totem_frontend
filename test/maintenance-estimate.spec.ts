import { describe, expect, it } from "vitest";
import { maintenanceHtml } from "../lib/maintenance";

const now = Date.parse("2026-10-24T10:00:00Z");
describe("maintenance estimate", () => {
  it.each(["fr", "en"] as const)("keeps the default %s message without a valid date", (locale) => {
    const original = maintenanceHtml(locale, { now });
    for (const endAt of ["", "invalid", "2026-10-25T15:00:00", '<script>alert(1)</script>', "2026-99-99T15:00:00Z"]) {
      expect(maintenanceHtml(locale, { now, endAt })).toBe(original);
    }
  });
  it.each(["fr", "en"] as const)("formats the future estimate in Lagos time in %s", (locale) => {
    const html = maintenanceHtml(locale, { now, endAt: "2026-10-25T15:00:00+01:00" });
    expect(html).toContain(locale === "fr" ? "Retour estimé" : "Expected back");
    expect(html).toContain(locale === "fr" ? "octobre" : "October");
    expect(html).toContain("15:00");
    expect(html).toContain("Lagos");
    expect(html).toBe(maintenanceHtml(locale, { now, endAt: "2026-10-25T14:00:00Z" }));
  });
  it.each(["fr", "en"] as const)("retains the maintenance page after the estimated end in %s", (locale) => {
    const html = maintenanceHtml(locale, { now, endAt: "2026-10-24T10:00:00Z" });
    expect(html).toContain(locale === "fr" ? "La maintenance se prolonge" : "longer than expected");
    expect(html).toContain(locale === "fr" ? "Maintenance en cours." : "Under maintenance.");
  });
});
