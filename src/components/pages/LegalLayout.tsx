import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { LEGAL } from "@/lib/legal";

export type LegalSection = { title: string; body: ReactNode };

/**
 * Gabarit partagé des pages légales (Mentions, CGV, Confidentialité).
 * Garantit une mise en page et une typographie cohérentes.
 */
export function LegalLayout({
  title,
  subtitle,
  intro,
  sections,
}: {
  title: string;
  subtitle: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} />
      <section
        className="premium-page px-5 pb-24 md:px-10"
        style={{ background: "var(--nuit-profonde)" }}
      >
        <article
          className="premium-panel mx-auto max-w-3xl space-y-8 p-6 text-[15px] leading-[1.85] md:p-8"
          style={{ color: "var(--ivoire)" }}
        >
          {intro && <div className="space-y-3 premium-muted">{intro}</div>}
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="h-display mb-3 text-2xl" style={{ color: "var(--or-ancestral)" }}>
                {section.title}
              </h2>
              <div className="space-y-3">{section.body}</div>
            </div>
          ))}
          <p className="caption pt-4 premium-soft">Dernière mise à jour : {LEGAL.updated}</p>
        </article>
      </section>
    </>
  );
}
