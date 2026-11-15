import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { OfferFeatures } from "@/components/ui/OfferFeatures";
import { ADULT_OFFER_IDS } from "@/lib/offers";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function Offres({ dict, lang }: { dict: Dictionary["offres"]; lang: Locale }) {
  return (
    <section className="site-section">
      <Reveal variant="up" className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </Reveal>

      <div className="site-container mt-8 grid gap-6 lg:grid-cols-2" style={{ maxWidth: "68rem" }}>
        {dict.items.map((offre, index) => (
          <Reveal
            key={offre.title}
            variant="scale"
            delay={index * 120}
            className={`flex min-w-0 flex-col gap-3 border bg-indigo p-5 sm:p-6 ${
              offre.featured
                ? "border-[1.5px] border-or shadow-[0_24px_60px_rgba(201,168,76,0.12)]"
                : "border-ombre"
            }`}
          >
            {offre.featured ? (
              <span className="w-fit bg-or px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-nuit">
                {offre.tag}
              </span>
            ) : (
              <span className="flex min-h-7 items-center text-xs uppercase tracking-[0.14em] text-or">
                {offre.tag}
              </span>
            )}

            <h3 className="font-display text-2xl text-ivoire sm:text-3xl">{offre.title}</h3>
            <p className="font-display text-lg leading-snug italic text-orpale lg:min-h-[2.75em]">{offre.lead}</p>

            <div className="flex flex-col gap-1">
              <span className="font-display text-4xl text-ivoire sm:text-5xl">{offre.price}</span>
              {offre.priceCaption && <span className="text-sm text-grisclair">{offre.priceCaption}</span>}
            </div>

            <OfferFeatures features={offre.features} />

            {/* le JSON donne "variant" comme un simple string ; on précise
                à Button qu'il n'y a en réalité que ces deux valeurs possibles */}
            <Button
              variant={offre.variant as "gold" | "outline"}
              className="mt-auto w-full"
              href={`/${lang}/inscription?offre=${ADULT_OFFER_IDS[index] ?? "ancestral"}`}
            >
              {offre.button}
            </Button>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-md flex-col items-center gap-2.5 text-center">
        <p className="text-sm text-grisclair">{dict.footerText}</p>
        {dict.giftLine && <p className="text-xs tracking-wide text-or">{dict.giftLine}</p>}
      </div>
    </section>
  );
}
