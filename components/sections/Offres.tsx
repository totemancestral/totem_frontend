import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// Ordre du catalogue dans le dictionnaire : Origine, Révélation (Ancestral), Famille.
const OFFER_IDS = ["origine", "ancestral", "famille"] as const;

export default function Offres({ dict, lang }: { dict: Dictionary["offres"]; lang: Locale }) {
  return (
    <section className="px-6 py-24 lg:px-16 lg:py-32">
      <Reveal variant="up" className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </Reveal>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-8 lg:mt-20 lg:flex-row lg:items-start">
        {dict.items.map((offre, index) => (
          <Reveal
            key={offre.title}
            variant="scale"
            delay={index * 120}
            className={`flex flex-1 flex-col gap-5 border bg-indigo p-9 ${
              offre.featured
                ? "border-[1.5px] border-or shadow-[0_24px_60px_rgba(201,168,76,0.12)] lg:-mt-5"
                : "border-ombre"
            }`}
          >
            {offre.featured ? (
              <span className="w-fit bg-or px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-nuit">
                {offre.tag}
              </span>
            ) : (
              <span className="text-xs uppercase tracking-[0.14em] text-or">
                {offre.tag}
              </span>
            )}

            <h3 className="font-display text-2xl text-ivoire">{offre.title}</h3>
            <p className="font-display text-xl italic text-orpale">{offre.lead}</p>

            <div className="flex flex-col gap-1">
              <span className="font-display text-4xl text-ivoire">{offre.price}</span>
              <span className="text-sm text-grisclair">{offre.priceCaption}</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {offre.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-or" />
                  <span
                    className={`text-sm ${offre.featured ? "text-ivoire" : "text-grisclair"}`}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* le JSON donne "variant" comme un simple string ; on précise
                à Button qu'il n'y a en réalité que ces deux valeurs possibles */}
            <Button
              variant={offre.variant as "gold" | "outline"}
              className="mt-2 w-full"
              href={`/${lang}/inscription?offre=${OFFER_IDS[index] ?? "ancestral"}`}
            >
              {offre.button}
            </Button>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-md flex-col items-center gap-2.5 text-center">
        <p className="text-sm text-grisclair">{dict.footerText}</p>
        <p className="text-xs tracking-wide text-or">{dict.giftLine}</p>
      </div>
    </section>
  );
}
