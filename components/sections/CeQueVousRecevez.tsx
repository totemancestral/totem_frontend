import type { CSSProperties } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#D8D0BC",
  "--color-or": "#B08A3E",
  "--color-orpale": "#8B6F2E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#948C78",
} as CSSProperties;

// Une icône par élément, dans le même ordre que dict.items — pas
// traduisible, donc gardée ici plutôt que dans le dictionnaire.
const icons = [
  // Le Parchemin
  <svg key="parchemin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.3">
    <rect x="4" y="3" width="16" height="18" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </svg>,
  // La Voix
  <svg key="voix" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.3">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12a4 4 0 0 1 8 0" />
    <line x1="12" y1="16" x2="12" y2="19" />
  </svg>,
  // Le Visage
  <svg key="visage" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.3">
    <rect x="3" y="4" width="18" height="16" />
    <circle cx="9" cy="10" r="2" />
    <path d="M3 17l5-5 4 4 3-3 6 6" />
  </svg>,
  // La Carte ancestrale
  <svg key="carte" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.3">
    <rect x="4" y="5" width="16" height="14" />
    <line x1="4" y1="10" x2="20" y2="10" />
    <circle cx="9" cy="14" r="1.4" />
  </svg>,
  // Le Certificat
  <svg key="certificat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--or)" strokeWidth="1.3">
    <path d="M12 3l2.5 5 5.5 0.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-0.8z" />
  </svg>,
];

export default function CeQueVousRecevez({ dict }: { dict: Dictionary["ceQueVousRecevez"] }) {
  return (
    <section className="px-6 py-24 lg:px-16 lg:py-32" style={ivoireScope}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-5 lg:mt-20 lg:grid-cols-5">
        {dict.items.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-4 border border-ombre bg-indigo px-4 py-8 text-center"
          >
            {icons[i]}
            <span className="text-sm font-medium text-ivoire">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
