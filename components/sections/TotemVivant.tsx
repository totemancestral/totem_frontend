import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function TotemVivant({ dict }: { dict: Dictionary["totemVivant"] }) {
  return (
    <section className="bg-nuit px-6 pb-24 lg:px-16 lg:pb-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 border border-ombre bg-indigo p-10 text-center lg:p-14">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h2>
        <p className="font-display text-lg italic text-orpale">{dict.lead}</p>
        <p className="max-w-md text-sm leading-relaxed text-grisclair">{dict.text}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl text-or">{dict.price}</span>
          <span className="text-sm text-grisclair">{dict.priceUnit}</span>
        </div>
        <p className="text-xs text-gris">{dict.caption}</p>
      </div>
    </section>
  );
}
