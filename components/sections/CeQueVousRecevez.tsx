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

export default function CeQueVousRecevez({ dict }: { dict: Dictionary["ceQueVousRecevez"] }) {
  return (
    <section className="site-section" style={ivoireScope}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </div>

      <div className="site-container site-stack grid grid-cols-2 gap-5 lg:grid-cols-4">
        {dict.items.map((item) => (
          <div
            key={item.label}
            className="flex min-h-32 items-center justify-center border border-ombre bg-indigo px-4 py-8 text-center"
          >
            <span className="text-sm font-medium text-ivoire">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
