import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Hero,
  LeGeste,
  Experience,
  Oeuvre,
  Avis,
  CtaFinal,
  Manifeste,
} from "@/components/sections";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { IntroExperience } from "@/components/IntroExperience";
import { AmbientAudio } from "@/components/AmbientAudio";

export const Route = createFileRoute("/")({
  component: Index,
});

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

function Index() {
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
      <AmbientAudio active={introDone} />
      <Hero />
      <LeGeste />
      <Manifeste />
      <Oeuvre />
      <Experience />
      <Avis />
      <ExperienceConsignes />
      <CtaFinal />
    </>
  );
}
