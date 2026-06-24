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

export function HomePage() {
  return (
    <>
      <SiteTourModal active />
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
    </>
  );
}
