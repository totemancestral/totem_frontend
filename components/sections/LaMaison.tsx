import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function LaMaison({ dict, lang }: { dict: Dictionary["laMaison"]; lang: Locale }) {
  return (
    <section className="site-section bg-ivoire">
      <div className="site-container site-gap flex flex-col items-center lg:flex-row">

        <Reveal variant="left" className="relative aspect-square w-full max-w-[320px] shrink-0 overflow-hidden border border-nuit/10 lg:w-[40%] lg:max-w-xl">
          <Image
            src="/images/totem-mask-or-1024.png"
            alt=""
            fill
            sizes="(min-width: 1536px) 576px, (min-width: 1024px) 37vw, 320px"
            className="object-cover grayscale contrast-[1.2] brightness-125 mix-blend-multiply"
          />
        </Reveal>

        <Reveal variant="right" className="flex flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-gris">{dict.eyebrow}</p>
          <h2 className="font-display text-3xl text-nuit lg:text-5xl">{dict.title}</h2>
          {dict.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[65ch] text-sm text-gris lg:text-base">
              {paragraph}
            </p>
          ))}
          <Link href={`/${lang}/la-maison`} className="text-xs uppercase tracking-[0.14em] text-nuit underline underline-offset-4">
            {dict.readMore}
          </Link>
        </Reveal>

      </div>
    </section>
  );
}
