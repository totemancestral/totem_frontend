"use client";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import HeroVideo from "@/components/sections/HeroVideo";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function Hero({ dict, lang }: { dict: Dictionary["hero"]; lang: Locale }) {
  return (
    // Le conteneur du Hero : plein écran sur mobile, contenu plaqué en bas
    // (justify-end) pour laisser la vidéo de fond bien visible au-dessus.
    // Repositionné en absolu à partir de "lg" comme dans la maquette.
    <div className="relative flex min-h-screen flex-col items-center justify-end gap-6 overflow-hidden bg-nuit px-6 pb-14 text-center lg:block lg:h-[960px] lg:px-0 lg:pb-0 lg:text-left">

      {/* vidéo de fond, placée en premier donc visuellement derrière tout le reste */}
      <HeroVideo />

      {/* étiquette suspendue : cachée sur mobile, visible à partir de lg */}
      <Reveal
        variant="up"
        className="relative z-10 mx-auto hidden w-[126px] rotate-[-4deg] border border-dashed border-ombre p-4 lg:flex lg:flex-col lg:gap-2 lg:absolute lg:top-28 lg:left-16 lg:mx-0"
      >
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border border-ombre bg-nuit" />
        <span className="text-[11px] tracking-wide text-or uppercase">{dict.tagLabel}</span>
        <span className="font-display text-3xl text-ivoire">{dict.tagNumber}</span>
        <span className="text-[9.5px] tracking-wide text-gris uppercase">{dict.tagCaption}</span>
      </Reveal>

      {/* titre */}
      <Reveal variant="up" className="relative z-10 lg:absolute lg:left-24 lg:bottom-72 lg:max-w-4xl">
        <p className="font-display italic text-base text-orpale lg:text-3xl">
          {dict.leadIn}
        </p>
        <h1 className="font-display text-3xl leading-tight text-ivoire lg:text-8xl lg:leading-none">
          {dict.title}
        </h1>
      </Reveal>

      {/* description + appel à l'action */}
      <Reveal
        variant="up"
        delay={150}
        className="relative z-10 flex flex-col items-center gap-6 lg:absolute lg:left-24 lg:bottom-40 lg:flex-row lg:items-center lg:gap-10"
      >
        <p className="max-w-md text-sm leading-relaxed text-grisclair lg:max-w-xs">
          {dict.description}
        </p>
        <Button variant="outline" href={`/${lang}/inscription`}>{dict.cta}</Button>
      </Reveal>

      {/* légende courte, sous la description : réservée au bureau, alignée sur la même colonne */}
      <Reveal
        as="p"
        variant="up"
        delay={250}
        className="relative z-10 hidden text-[11px] tracking-wide text-gris uppercase lg:absolute lg:block lg:left-24 lg:bottom-28"
      >
        {dict.microCaption}
      </Reveal>

      {/* photo détail, en zoom lent continu : réservée au bureau,
          remontée au niveau du bloc de texte plutôt que collée en bas */}
      <Reveal
        variant="right"
        className="absolute bottom-40 right-16 z-10 hidden h-[300px] w-[300px] items-center justify-center overflow-hidden border-t border-l border-ombre bg-nuit lg:flex"
      >
        <div className="relative h-[105px] w-full animate-[kenburns_16s_ease-in-out_infinite_alternate] overflow-hidden">
          <Image
            src="/images/yeux_totem_original_recadres.png"
            alt=""
            fill
            className="object-cover grayscale contrast-[1.2] brightness-110 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-or mix-blend-color" />
        </div>
      </Reveal>

    </div>
  );
}
