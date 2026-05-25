import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Hero,
  LeGeste,
  Experience,
  Oeuvre,
  Offres,
  Maison,
  Avis,
  CtaFinal,
} from "@/components/sections";
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
      <Experience />
      <Oeuvre />
      <Offres />
      <Maison />
      <Avis />
      <CtaFinal />
    </>
  );
}
