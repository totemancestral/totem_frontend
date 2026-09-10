import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function Manifeste({ dict }: { dict: Dictionary["manifeste"] }) {
  return (
    <section className="py-24 lg:py-32">
      <Reveal variant="up" className="px-6 text-center lg:px-16">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </Reveal>

      <div className="mt-16 flex flex-col items-start lg:mt-20 lg:flex-row lg:pr-16">
        {/* les 3 affirmations : commencent à la même hauteur que la photo, sans lignes de séparation */}
        <Reveal variant="left" className="flex flex-1 flex-col gap-10 px-6 lg:px-16">
          {dict.points.map((point, i) => (
            <Reveal key={point.title} variant="up" delay={i * 100} className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-ivoire">{point.title}</h3>
              <p className="text-sm leading-relaxed text-grisclair lg:text-base">
                {point.text}
              </p>
            </Reveal>
          ))}
        </Reveal>

        {/* la grande photo : réservée au bureau, retirée sur mobile */}
        <Reveal variant="right" className="relative hidden shrink-0 bg-nuit p-6 lg:block lg:h-[800px] lg:w-2/3">
          <div className="relative h-full w-full overflow-hidden border border-ombre">
            <Image
              src="/images/totem-mask.jpg"
              alt=""
              fill
              className="object-cover grayscale contrast-[1.15] brightness-105 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-or mix-blend-color" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
