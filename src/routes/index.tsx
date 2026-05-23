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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [introDone, setIntroDone] = useState(false);
  return (
    <>
      {!introDone && <IntroExperience onFinished={() => setIntroDone(true)} />}
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
