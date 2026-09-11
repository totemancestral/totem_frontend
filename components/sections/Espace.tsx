"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";

type Props = {
  dict: Dictionary["espace"];
  lang: Locale;
};

export default function Espace({ dict, lang }: Props) {
  const { commandes, error } = useCommandes();
  const works = (commandes ?? []).filter((c) => c.oeuvre);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-24">
      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h1>
        <p className="mt-1 max-w-lg text-sm text-grisclair">{dict.intro}</p>
      </div>

      {/* carte de statut : la consultation hebdomadaire est un rituel sur un
          Totem déjà composé — ne pas la montrer avant qu'il en existe un. */}
      {works.length > 0 && (
        <div className="mt-9 flex flex-col items-start gap-6 border-[1.5px] border-or bg-indigo p-9 shadow-[0_20px_50px_rgba(201,168,76,0.1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-or">{dict.statusLabel}</span>
            <span className="font-display text-xl italic text-ivoire">{dict.statusText}</span>
          </div>
          <Button href={`/${lang}/consultation-question`} className="shrink-0 whitespace-nowrap">
            {dict.discoverButton}
          </Button>
        </div>
      )}

      {/* grille des œuvres */}
      <div className="mt-10 flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.gridLabel}</p>
        </div>

        {commandes === null && !error && <p className="text-sm text-grisclair">…</p>}
        {(commandes !== null || error) && works.length === 0 && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-grisclair">{dict.emptyText}</p>
            <Button href={`/${lang}/parcours`}>{dict.resumeButton}</Button>
          </div>
        )}

        {works.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((commande) => (
              <Link
                key={commande.id}
                href={`/${lang}/oeuvre?commande=${commande.id}`}
                className="flex flex-col border border-ombre bg-indigo transition-colors hover:border-or"
              >
                <div className="relative h-55 overflow-hidden border-b border-ombre bg-nuit">
                  {commande.oeuvre?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element -- image générée dynamiquement, domaine backend non préconfiguré
                    <img
                      src={commande.oeuvre.image_url}
                      alt=""
                      className="h-full w-full object-cover grayscale contrast-[1.15] brightness-110"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-3.5 p-5.5">
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-xl italic text-ivoire">{commande.oeuvre?.nom_totem}</span>
                    <span className="text-xs text-grisclair">N° {commande.oeuvre?.numero_serie}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-ombre px-4 py-2 text-xs font-medium text-ivoire">{dict.recitLabel}</span>
                    <span className="border border-ombre px-4 py-2 text-xs font-medium text-ivoire">{dict.imageLabel}</span>
                    <span className="border border-ombre px-4 py-2 text-xs font-medium text-ivoire">{dict.audioLabel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
