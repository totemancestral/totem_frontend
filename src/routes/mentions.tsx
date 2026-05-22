import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/mentions")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Totem Ancestral" },
      { name: "description", content: "Mentions légales de Totem Ancestral." },
      { property: "og:title", content: "Mentions légales — Totem Ancestral" },
      { property: "og:description", content: "Mentions légales de Totem Ancestral." },
    ],
  }),
  component: MentionsPage,
});

function MentionsPage() {
  return (
    <>
      <PageHero title="Mentions légales" />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <article className="max-w-2xl mx-auto space-y-6 text-[15px] leading-[1.85]" style={{ color: "var(--ivoire)" }}>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>Éditeur</h2>
            <p>
              SENYCE PARTNERS — Maison de création artistique
              <br />
              Siège social : Paris, France
              <br />
              Contact : <a href="mailto:contact@totemancestral.com" className="link-gold">contact@totemancestral.com</a>
            </p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>Directeur de la publication</h2>
            <p>SENYCE PARTNERS.</p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>Hébergement</h2>
            <p>Le site est hébergé sur une infrastructure cloud sécurisée. Détails communiqués sur simple demande.</p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur ce site — textes, visuels, identité, charte —
              est protégé par les lois de propriété intellectuelle et appartient à SENYCE PARTNERS.
              Toute reproduction est interdite sans autorisation préalable.
            </p>
          </div>
        </article>
      </section>
    </>
  );
}
