import { createFileRoute } from "@tanstack/react-router";
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
import { AmbientAudio } from "@/components/AmbientAudio";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <AmbientAudio active />
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
