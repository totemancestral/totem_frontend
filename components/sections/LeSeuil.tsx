import Image from "next/image";
import { getSeuilImage } from "@/lib/seuil-images";
import { Reveal } from "@/components/ui/Reveal";
import { LeSeuilPinned } from "@/components/sections/LeSeuilPinned";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const imagePositions: Record<string, string> = {
  "/images/seuil_0.png": "45% 50%",
  "/images/seuil_1.png": "45% 50%",
  "/images/seuil_2.png": "50% 50%",
  "/images/seuil_3.png": "55% 50%",
};

export default function LeSeuil({ dict }: { dict: Dictionary["leSeuil"] }) {
  return (
    <section id="experience" className="site-gutters site-section-start scroll-mt-24 bg-indigo pb-4 lg:pb-6">
      <div className="site-container">
        {/* en-tête */}
        <Reveal variant="up" className="flex flex-col gap-6 text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <p className="font-display mt-2 text-xl italic text-orpale">{dict.leadIn}</p>
            <h2 className="font-display text-4xl text-ivoire lg:text-6xl">{dict.title}</h2>
          </div>
          <p className="max-w-xs text-sm text-grisclair">{dict.intro}</p>
        </Reveal>

        {/* Format commun sur mobile/tablette ; la version fixe prend le relais à xl. */}
        <div className="site-stack site-gap flex flex-col xl:hidden">
          {dict.gestes.map((geste) => (
            <div key={geste.title} className="flex flex-col gap-8">
              <Reveal
                variant={geste.imageFirst ? "left" : "right"}
                className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden border border-ombre bg-nuit"
              >
                <Image
                  src={getSeuilImage(geste.image)}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 1px, (min-width: 816px) 768px, calc(100vw - 48px)"
                  style={{ objectPosition: imagePositions[geste.image] ?? "center" }}
                  className="object-cover grayscale contrast-[1.1] brightness-105"
                />
                <div className="absolute inset-0 bg-or opacity-45 mix-blend-color" />
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
