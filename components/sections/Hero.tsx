"use client";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import HeroVideo from "@/components/sections/HeroVideo";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function Hero({ dict, lang, mediaCopy }: { dict: Dictionary["hero"]; lang: Locale; mediaCopy: Dictionary["media"] }) {
  return (
    // La navigation fixe est comprise dans la hauteur du premier écran.
    // Toute la composition est ancrée au-dessus de la zone des commandes.
    // Elle reste dans le flux pour grandir si le zoom ou la hauteur l'exige.
    <div data-hero className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-nuit px-6 pb-24 pt-36 text-center lg:px-16 lg:pb-[73px] lg:text-left xl:px-24">

      {/* vidéo de fond, placée en premier donc visuellement derrière tout le reste */}
      <HeroVideo copy={mediaCopy} />

      {/* étiquette suspendue : cachée sur mobile, visible à partir de lg */}
      <Reveal
        variant="up"
        className="hero-tag absolute left-16 top-32 z-10 hidden w-[126px] rotate-[-4deg] flex-col gap-2 border border-dashed border-ombre p-4"
      >
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border border-ombre bg-nuit" />
        <span className="text-[11px] tracking-wide text-or uppercase">{dict.tagLabel}</span>
        <span className="font-display text-3xl text-ivoire">{dict.tagNumber}</span>
        <span className="text-[9.5px] tracking-wide text-gris uppercase">{dict.tagCaption}</span>
      </Reveal>

      <div data-hero-composition className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:items-end lg:grid-cols-[minmax(0,1fr)_clamp(12rem,21vw,20rem)]">
      <div className="hero-copy flex min-w-0 flex-col gap-7 lg:translate-y-[60px]">
      {/* titre */}
      <Reveal variant="up">
        <p className="font-display italic text-base text-orpale lg:text-3xl">
          {dict.leadIn}
        </p>
        <h1 className="font-display text-3xl leading-tight text-ivoire lg:text-[clamp(2.5rem,5.3vw,6rem)] lg:leading-none">
          {dict.title}
        </h1>
      </Reveal>

      {/* description + appel à l'action */}
      <Reveal
        variant="up"
        delay={150}
        className="flex flex-col items-center gap-6 lg:items-start xl:flex-row xl:items-center xl:gap-10"
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
        className="hidden text-[11px] uppercase tracking-wide text-gris lg:block"
      >
        {dict.microCaption}
      </Reveal>
      </div>

      {/* photo détail, en zoom lent continu : réservée au bureau,
          remontée au niveau du bloc de texte plutôt que collée en bas */}
      <Reveal
        variant="right"
        className="relative hidden aspect-square w-full items-center justify-center overflow-hidden border-t border-l border-ombre bg-nuit lg:flex"
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

    </div>
  );
}
