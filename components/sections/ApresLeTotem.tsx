import Image from "next/image";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// On redéfinit ici les mêmes variables que globals.css, avec des valeurs
// "ivoire réchauffé" — tout ce qui utilise bg-nuit / text-or / etc. à
// l'intérieur de cette section (même dans Button, ailleurs) héritera de
// CES valeurs plutôt que du thème sombre global.
// Le "as CSSProperties" est nécessaire car TypeScript ne connaît pas par
// défaut les propriétés CSS personnalisées (--xxx) sur un style React.
const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#D8D0BC",
  "--color-or": "#B08A3E",
  "--color-orpale": "#8B6F2E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#948C78",
} as CSSProperties;

export default function ApresLeTotem({ dict, lang }: { dict: Dictionary["apresLeTotem"]; lang: Locale }) {
  return (
    <section className="px-6 py-24 lg:px-16 lg:py-32" style={ivoireScope}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 text-center lg:flex-row lg:text-left">

        <Reveal variant="left" className="flex flex-1 flex-col items-center gap-6 lg:items-start">
          <div className="flex items-center gap-3">
            <div className="relative h-[17px] w-[26px] shrink-0">
              <Image
                src="/images/cauris_site_trimmed.png"
                alt=""
                fill
                sizes="26px"
                className="object-contain contrast-[1.1] brightness-105 saturate-[1.15]"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
          </div>

          <h2 className="font-display text-3xl text-ivoire lg:text-5xl">{dict.title}</h2>

          <p className="font-display max-w-md text-lg italic text-orpale">{dict.lead}</p>

          <p className="max-w-md text-sm text-grisclair">{dict.text}</p>

          <Button href={`/${lang}/inscription`}>{dict.cta}</Button>
        </Reveal>

        <Reveal variant="right" className="relative h-[300px] w-full flex-1 overflow-hidden border border-ombre lg:h-[560px]">
          {/* fond clair : traitement "encre sur papier" (multiply, sans surcouche dorée) */}
          <Image
            src="/images/cauris_image.png"
            alt=""
            fill
            className="object-cover grayscale contrast-[1.15] mix-blend-multiply"
          />
        </Reveal>

      </div>
    </section>
  );
}
