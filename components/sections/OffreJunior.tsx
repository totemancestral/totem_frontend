import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function OffreJunior({ dict, lang }: { dict: Dictionary["offreJunior"]; lang: Locale }) {
  return (
    <section className="px-6 pb-24 lg:px-16 lg:pb-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-3xl text-ivoire lg:text-4xl">{dict.title}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </div>

      <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-5 border border-[1.5px] border-or bg-indigo p-9 text-center shadow-[0_24px_60px_rgba(201,168,76,0.12)]">
        <span className="w-fit bg-or px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-nuit">
          {dict.badge}
        </span>

        <h3 className="font-display text-2xl text-ivoire">{dict.cardTitle}</h3>
        <p className="font-display text-xl italic text-orpale">{dict.lead}</p>

        <div className="flex flex-col gap-1">
          <span className="font-display text-4xl text-ivoire">{dict.price}</span>
          <span className="text-sm text-grisclair">{dict.priceCaption}</span>
        </div>

        <div className="flex flex-col gap-3.5 self-stretch">
          {dict.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-left">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-or" />
              <span className="text-sm text-ivoire">{feature}</span>
            </div>
          ))}
        </div>

        <Button className="mt-2 w-full" href={`/${lang}/inscription`}>{dict.button}</Button>
      </div>
    </section>
  );
}
