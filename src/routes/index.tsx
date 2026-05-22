import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
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
