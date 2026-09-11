"use client";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";

export default function Consultations({ dict, lang }: { dict: Dictionary["consultations"]; lang: Locale }) {
  const { commandes } = useCommandes();
  const hasWork = (commandes ?? []).some((c) => c.oeuvre);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-24">
      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h1>
        <p className="mt-1 max-w-lg text-sm text-grisclair">{dict.intro}</p>
      </div>

      {/* carte de statut : la consultation hebdomadaire est un rituel sur un
          Totem déjà composé — ne pas la montrer avant qu'il en existe un. */}
      {hasWork && (
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

      {/* historique */}
      <div className="mt-10 flex flex-col gap-5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.historyLabel}</p>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {dict.history.map((item) => (
            <div key={item.week} className="flex flex-col border border-ombre bg-indigo">
              <div className="flex h-25 items-center justify-center border-b border-ombre bg-nuit">
                <div className="relative h-11 w-16">
                  <Image
                    src="/images/cauris_site_trimmed.png"
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain contrast-[1.1] brightness-105 saturate-[1.15]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3.5 p-5.5">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-xl italic text-ivoire">{item.title}</span>
                  <span className="text-xs text-grisclair">{item.week}</span>
                </div>
                <p className="font-display text-sm italic leading-relaxed text-grisclair">{item.reading}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
