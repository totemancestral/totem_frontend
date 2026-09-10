import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { LeSeuilPinned } from "@/components/sections/LeSeuilPinned";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function LeSeuil({ dict }: { dict: Dictionary["leSeuil"] }) {
  return (
    <section id="experience" className="scroll-mt-24 bg-indigo px-6 pb-4 pt-24 lg:px-16 lg:pb-6 lg:pt-32">
      <div className="mx-auto max-w-6xl">
        {/* en-tête */}
        <Reveal variant="up" className="flex flex-col gap-6 text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <p className="font-display mt-2 text-xl italic text-orpale">{dict.leadIn}</p>
            <h2 className="font-display text-4xl text-ivoire lg:text-6xl">{dict.title}</h2>
          </div>
          <p className="max-w-xs text-sm text-grisclair">{dict.intro}</p>
        </Reveal>

        {/* les 4 gestes, empilés : réservé au mobile, la version "pinned"
            au scroll (LeSeuilPinned) prend le relais à partir de lg */}
        <div className="mt-16 flex flex-col gap-14 lg:hidden">
          {dict.gestes.map((geste) => (
            <div key={geste.title} className="flex flex-col gap-8">
              <Reveal
                variant={geste.imageFirst ? "left" : "right"}
                className="relative h-[260px] w-full overflow-hidden border border-ombre bg-nuit"
              >
                <Image
                  src={geste.image}
                  alt=""
                  fill
                  className="object-cover grayscale contrast-[1.15] brightness-110 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-or mix-blend-color" />
              </Reveal>
              <Reveal variant={geste.imageFirst ? "right" : "left"} delay={100} className="flex flex-col gap-3">
                <h3 className="text-xl font-medium text-ivoire">{geste.title}</h3>
                <p className="text-sm leading-relaxed text-grisclair">{geste.text}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      <LeSeuilPinned gestes={dict.gestes} />
    </section>
  );
}
