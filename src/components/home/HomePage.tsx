"use client";

import { useEffect, useState } from "react";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { IntroExperience } from "@/components/IntroExperience";
import { SiteTourModal } from "@/components/SiteTourModal";
import { ContactSection } from "@/components/pages/ContactPage";
import {
  Assurances,
  Avis,
  CtaFinal,
  Experience,
  FAQ,
  Hero,
  LeGeste,
  Manifeste,
  Maison,
  Oeuvre,
  Offres,
  ProofBand,
} from "@/components/sections";

const INTRO_SESSION_KEY = "totem_intro_played";

export function HomePage() {
  const [introState, setIntroState] = useState<"checking" | "pending" | "done">("checking");

  useEffect(() => {
    try {
      setIntroState(sessionStorage.getItem(INTRO_SESSION_KEY) === "true" ? "done" : "pending");
    } catch {
      setIntroState("pending");
    }
  }, []);

  const finishIntro = () => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    } catch {
      /* noop */
    }
    setIntroState("done");
  };

  const introDone = introState === "done";

  return (
    <>
      {introState === "pending" && <IntroExperience onFinished={finishIntro} />}
      <SiteTourModal active={introDone} />
      <Hero />
      <ProofBand />
      <LeGeste />
      <Manifeste />
      <Oeuvre />
      <Experience />
      <ExperienceConsignes />
      <Assurances />
      <Offres />
      <Maison />
      <Avis />
      <FAQ />
      <ContactSection compact />
      <CtaFinal />
    </>
  );
}
