"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import { OfferFeatures } from "@/components/ui/OfferFeatures";
import { ADULT_OFFER_IDS } from "@/lib/offers";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// Étape intercalée entre le parcours et le paiement, uniquement quand la
// personne a commencé sans offre déjà choisie (ex: via "Composer" dans la
// nav plutôt que depuis /offres). Réutilise le même contenu (dict.offres)
// que la page marketing — une seule source pour les noms/prix/descriptions,
// pour ne jamais afficher un tarif différent de celui réellement facturé.
export default function ChoisirOffre({
  dict,
  offresDict,
  lang,
}: {
  dict: Dictionary["paiement"];
  offresDict: Dictionary["offres"];
  lang: Locale;
}) {
  const parcours = useSearchParams().get("parcours");
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit px-6 py-12 lg:px-16">
      <div className="flex items-center justify-between">
        <Brand lang={lang} />
        <Link href={`/${lang}/espace`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.cancel}
        </Link>
      </div>

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{offresDict.eyebrow}</p>
        <h1 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{offresDict.title}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{offresDict.intro}</p>
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        {offresDict.items.map((offre, index) => (
          <div
            key={offre.title}
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
              <span className="flex min-h-7 items-center text-xs uppercase tracking-[0.14em] text-or">{offre.tag}</span>
            )}

            <h2 className="font-display text-2xl text-ivoire sm:text-3xl">{offre.title}</h2>
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
              href={`/${lang}/paiement?${new URLSearchParams({ offre: ADULT_OFFER_IDS[index] ?? "ancestral", ...(parcours ? { parcours } : {}) })}`}
            >
              {offre.button}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
