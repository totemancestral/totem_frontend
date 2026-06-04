import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

function Index() {
  const [introDone, setIntroDone] = useState(false);
  return (
    <>
      {!introDone && <IntroExperience onFinished={() => setIntroDone(true)} />}
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
