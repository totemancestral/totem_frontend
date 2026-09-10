import type { Dictionary } from "@/app/[lang]/dictionaries";

type Props = {
  dict: Dictionary["laMaisonPage"];
};

// Nav (fixe, transparente en haut) et Footer viennent du layout partagé
// (marketing) — cette page ne fournit que son propre contenu, avec assez
// de padding en haut pour dégager la barre de navigation.
export default function LaMaisonPage({ dict }: Props) {
  return (
    <div className="min-h-screen bg-nuit pt-32 lg:pt-40">
      {/* en-tête */}
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pb-14 text-center lg:px-16">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
        <p className="font-display text-xl italic text-orpale">{dict.subtitle}</p>
      </div>

      {/* manifeste */}
      <div className="mx-auto flex max-w-2xl flex-col gap-14 px-6 pb-24 lg:px-16">
        <p className="text-sm leading-relaxed text-grisclair">{dict.intro}</p>

        {dict.sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-or">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-grisclair">
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <p className="font-display mx-auto max-w-md text-center text-xl italic text-orpale">
          {dict.closingQuote}
        </p>
      </div>
    </div>
  );
}
