"use client";

import { useState } from "react";
import { IntroVideo } from "@/components/IntroVideo";
import { SiteTourModal } from "@/components/SiteTourModal";
import {
  Avis,
  CtaFinal,
  FAQ,
  Hero,
  LeGeste,
  Manifeste,
  Maison,
  Offres,
  ProofBand,
} from "@/components/sections";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { LiquidGlassAtmosphere } from "@/components/liquid-glass/LiquidGlassAtmosphere";

export function HomePage() {
  // Le tour guidé n'apparaît qu'une fois l'intro passée, sinon les deux
  // voiles se superposeraient au premier chargement.
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="liquid-home-shell">
      <LiquidGlassAtmosphere />
      <IntroVideo onDone={() => setIntroDone(true)} />
      <SiteTourModal active={introDone} />
      <div className="relative z-10">
        <Hero />
        <ProofBand />
        <LeGeste />
        <Manifeste />
        <ExperienceConsignes />
        <Offres />
        <Maison />
        <Avis />
        <FAQ />
        <CtaFinal />
      </div>
    </div>
  );
}
