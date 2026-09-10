import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function LaMaison({ dict, lang }: { dict: Dictionary["laMaison"]; lang: Locale }) {
  return (
    <section className="bg-ivoire px-6 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

        <Reveal variant="left" className="relative h-[320px] w-full max-w-[320px] shrink-0 overflow-hidden border border-nuit/10">
          <Image
            src="/images/totem-mask-face.jpg"
            alt=""
            fill
            className="object-cover grayscale contrast-[1.2] brightness-125 mix-blend-multiply"
          />
        </Reveal>

        <Reveal variant="right" className="flex flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-gris">{dict.eyebrow}</p>
          <h2 className="font-display text-3xl text-nuit lg:text-5xl">{dict.title}</h2>
          {dict.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-gris lg:text-base">
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
