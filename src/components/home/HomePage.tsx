"use client";

import { useState } from "react";
import { AmbientAudio } from "@/components/AmbientAudio";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { IntroExperience } from "@/components/IntroExperience";
import { SiteTourModal } from "@/components/SiteTourModal";
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
  const [introState, setIntroState] = useState<"pending" | "done">("pending");

  const finishIntro = () => {
    setIntroState("done");
  };

  const introDone = introState === "done";

  return (
    <>
      {introState === "pending" && <IntroExperience onFinished={finishIntro} />}
      <SiteTourModal active={introDone} />
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
