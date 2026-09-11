"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// Même ordre que sur /offres et dans checkout.service.ts (backend).
const OFFER_IDS = ["origine", "ancestral", "famille"] as const;

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

      <div className="mx-auto mt-14 flex w-full max-w-6xl flex-1 flex-col gap-8 lg:flex-row lg:items-start">
        {offresDict.items.map((offre, index) => (
          <div
            key={offre.title}
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
              <span className="text-xs uppercase tracking-[0.14em] text-or">{offre.tag}</span>
            )}

            <h2 className="font-display text-2xl text-ivoire">{offre.title}</h2>
            <p className="font-display text-xl italic text-orpale">{offre.lead}</p>

            <div className="flex flex-col gap-1">
              <span className="font-display text-4xl text-ivoire">{offre.price}</span>
              <span className="text-sm text-grisclair">{offre.priceCaption}</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {offre.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-or" />
                  <span className={`text-sm ${offre.featured ? "text-ivoire" : "text-grisclair"}`}>
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
              href={`/${lang}/paiement?offre=${OFFER_IDS[index] ?? "ancestral"}`}
            >
              {offre.button}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
