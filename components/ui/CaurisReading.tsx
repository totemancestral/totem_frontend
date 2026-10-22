import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import type { CaurisReading as Reading } from "@/lib/cauris";

export function CaurisReading({ reading, copy, lang }: { reading: Reading; copy: Dictionary["cauris"]; lang: Locale }) {
  return <div className="flex flex-col gap-5">
    {reading.ancestralName && <p className="font-display text-xl text-or">{copy.forYou} {reading.ancestralName}</p>}
    {lang === "en" && <p className="text-xs text-grisclair">{copy.frenchNote}</p>}
    {reading.image && reading.parole && reading.geste ? (
      <dl className="flex flex-col gap-5">
        {([[copy.imageLabel, reading.image], [copy.paroleLabel, reading.parole], [copy.gesteLabel, reading.geste]] as const).map(([label, text]) => (
          <div key={label} className="flex flex-col gap-2">
            <dt className="text-xs uppercase tracking-wide text-or">{label}</dt>
            <dd lang="fr" className="font-display text-lg italic leading-relaxed text-ivoire">{text}</dd>
          </div>
        ))}
      </dl>
    ) : <p className="text-sm text-grisclair">{copy.readingUnavailable}</p>}
  </div>;
}
