"use client";

import { useEffect, useState } from "react";
import { SiteTourModal } from "@/components/SiteTourModal";
import {
  Avis,
  CtaFinal,
  FAQ,
  Hero,
  LeGeste,
  Manifeste,
  Maison,
  Offres,
  ProofBand,
} from "@/components/sections";
import { ExperienceConsignes } from "@/components/ExperienceConsignes";
import { LiquidGlassAtmosphere } from "@/components/liquid-glass/LiquidGlassAtmosphere";

export function HomePage() {
  // Le tour guidé n'apparaît qu'une fois l'intro passée, sinon les deux
  // voiles se superposeraient au premier chargement.
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    // L'intro est jouee par ClientChrome ; on attend sa fin (ou son absence
    // si elle a deja ete vue) avant de proposer le tour guide.
    const seen = (() => {
      try {
        return sessionStorage.getItem("totem_intro_seen") === "true";
      } catch {
        return false;
      }
    })();
    if (seen) {
      setIntroDone(true);
      return;
    }
    const onDone = () => setIntroDone(true);
    window.addEventListener("totem:intro-done", onDone);
    return () => window.removeEventListener("totem:intro-done", onDone);
  }, []);

  return (
    <div className="liquid-home-shell">
      <LiquidGlassAtmosphere />
      <SiteTourModal active={introDone} />
      <div className="relative z-10">
        <Hero />
        <ProofBand />
        <LeGeste />
        <Manifeste />
        <ExperienceConsignes />
        <Offres />
        <Maison />
        <Avis />
        <FAQ />
        <CtaFinal />
      </div>
    </div>
  );
}
