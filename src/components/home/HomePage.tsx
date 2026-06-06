"use client";

import { useEffect, useState } from "react";
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

const INTRO_SESSION_KEY = "totem_intro_played";

function hasPlayedIntro() {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    /* session storage can be unavailable in restricted browser contexts */
  }
}

export function HomePage() {
  const [introState, setIntroState] = useState<"checking" | "pending" | "done">("checking");

  useEffect(() => {
    const played = hasPlayedIntro();
    setIntroState(played ? "done" : "pending");
  }, []);

  const finishIntro = () => {
    rememberIntroPlayed();
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
