import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Espace from "../components/sections/Espace";
import { CanComposeTotemContext } from "../lib/hooks/useCanComposeTotem";
import type { CommandeRow } from "../lib/hooks/useCommandes";
import type { TotemJourney } from "../lib/hooks/useTotemJourney";
import fr from "../app/[lang]/dictionaries/fr.json";
import en from "../app/[lang]/dictionaries/en.json";

const mocks = vi.hoisted(() => ({ commandes: [] as CommandeRow[], journey: null as TotemJourney | null }));
vi.mock("../lib/hooks/useCommandes", () => ({
  useCommandes: () => ({ commandes: mocks.commandes, error: null, delayNotice: null }),
}));
vi.mock("../lib/hooks/useTotemJourney", () => ({
  useTotemJourney: (_lang: string, enabled: boolean) => ({ journey: enabled ? mocks.journey : null, error: false, retry: vi.fn() }),
}));
vi.mock("../components/sections/ConsultationStatus", () => ({ ConsultationStatus: () => null }));

const order: CommandeRow = {
  id: "order", offre: "origine", statut: "paye", montant_cents: 4900,
  devise: "eur", langue: "fr", created_at: "2026-01-01", stripe_session_id: "cs_paid",
  oeuvre: null,
};
beforeEach(() => { mocks.commandes = []; mocks.journey = null; });

for (const lang of ["fr", "en"] as const) {
  const dict = lang === "fr" ? fr : en;
  describe(`personal space composition (${lang})`, () => {
    function render(allowed: boolean | null) {
      return renderToStaticMarkup(createElement(CanComposeTotemContext.Provider, { value: allowed },
        createElement(Espace, { dict: dict.espace, caurisCopy: dict.cauris, lang }),
      ));
    }

    it("removes the composition card entirely once a Totem exists", () => {
      mocks.commandes = [{ ...order, statut: "livree", oeuvre: {
        nom_totem: "Totem", image_url: null, numero_serie: "001", statut: "livree",
      } }];
      const html = render(false);
      expect(html).not.toContain('id="journey-title"');
      expect(html).not.toContain(dict.espace.viewTotemCardLabel);
      expect(html).toContain(`href="/${lang}/commandes"`);
      expect(html).toContain(`href="/${lang}/oeuvres"`);
      expect(html).toContain(dict.espace.totemTitle);
    });

    it("waits for eligibility before showing an action", () => {
      mocks.journey = { href: `/${lang}/parcours`, resuming: false };
      expect(render(null)).not.toContain('id="journey-title"');
    });

    it("offers one prominent composition CTA for a new client", () => {
      mocks.journey = { href: `/${lang}/parcours`, resuming: false };
      const html = render(true);
      expect(html).toContain(dict.espace.composeTitle);
      expect(html).toContain(dict.espace.composeButton);
      expect(html.match(new RegExp(`href="/${lang}/parcours"`, "g"))).toHaveLength(1);
    });

    it("links directly to the saved unpaid draft", () => {
      mocks.journey = { href: `/${lang}/parcours?parcours=draft-id`, resuming: true };
      const html = render(true);
      expect(html).toContain(dict.espace.resumeTitle);
      expect(html).toContain(dict.espace.resumeButton);
      expect(html).toContain(`href="/${lang}/parcours?parcours=draft-id"`);
      expect(html).not.toContain(dict.espace.composeTitle);
    });

    it("resumes a paid questionnaire with its existing payment session", () => {
      mocks.commandes = [{ ...order, requiresQuestionnaire: true }];
      const html = render(true);
      expect(html).toContain(`href="/${lang}/parcours?session_id=cs_paid"`);
      expect(html).toContain(dict.espace.resumePaidText);
      expect(html).toContain(dict.espace.resumeButton);
    });

    it("offers no new composition while generation is underway", () => {
      mocks.commandes = [{ ...order, statut: "en_generation" }];
      mocks.journey = { href: `/${lang}/parcours`, resuming: false };
      expect(render(true)).not.toContain('id="journey-title"');
    });
  });
}
