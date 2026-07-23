"use client";

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
  return (
    <div className="liquid-home-shell">
      <LiquidGlassAtmosphere />
      <SiteTourModal active />
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
