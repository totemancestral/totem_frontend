"use client";

import { useState } from "react";
import { AmbientAudio } from "@/components/AmbientAudio";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { IntroExperience } from "@/components/IntroExperience";
import {
  Assurances,
  Avis,
  CtaFinal,
  Experience,
  Hero,
  LeGeste,
  Manifeste,
  Maison,
  Oeuvre,
  Offres,
  ProofBand,
} from "@/components/sections";

export function HomePage() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {!introDone && <IntroExperience onFinished={() => setIntroDone(true)} />}
      <AmbientAudio active={introDone} />
      <Hero />
      <ProofBand />
      <LeGeste />
      <Manifeste />
      <Oeuvre />
      <Experience />
      <Assurances />
      <Offres />
      <Maison />
      <Avis />
      <ExperienceConsignes />
      <CtaFinal />
    </>
  );
}
