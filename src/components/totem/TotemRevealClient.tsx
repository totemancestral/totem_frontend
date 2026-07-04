"use client";

import { useRef, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { mysticAudio } from "@/lib/mysticAudio";
import type { StorySection } from "@/lib/totem-v3";
import { GenerateStep } from "./GenerateStep";
import { LoadingStep } from "./LoadingStep";
import { RevealStep } from "./RevealStep";
import { ParchmentPdfDocument } from "./ParchmentPdfDocument";

type Step = "generate" | "loading" | "reveal";

interface TotemRevealClientProps {
  userName?: string;
  totemName: string;
  totemImage: string;
  subtitle?: string;
  sections: StorySection[];
  numeroSerie?: string;
  audioUrl?: string;
  pdfUrl?: string;
  onShare?: () => void;
  onClan?: () => void;
  onBack?: () => void;
  autoStart?: boolean;
}

export function TotemRevealClient({
  userName = "",
  totemName,
  totemImage,
  subtitle = "Decret royal de revelation symbolique",
  sections,
  numeroSerie,
  audioUrl,
  pdfUrl,
  onShare,
  onClan,
  onBack,
  autoStart = false,
}: TotemRevealClientProps) {
  const [step, setStep] = useState<Step>(autoStart ? "loading" : "generate");
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(() => {
    mysticAudio.startAmbient();
    setStep("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setStep("reveal");
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {step === "generate" && (
          <GenerateStep key="generate" onGenerate={handleGenerate} userFirstName={userName} />
        )}

        {step === "loading" && <LoadingStep key="loading" onComplete={handleLoadingComplete} />}

        {step === "reveal" && (
          <RevealStep
            key="reveal"
            data={{
              userName,
              totemName,
              totemImage,
              subtitle,
              sections,
              numeroSerie,
              audioUrl,
              pdfUrl,
            }}
            pdfRef={pdfRef}
            onBack={onBack ?? (() => {})}
            onShare={onShare}
            onClan={onClan}
          />
        )}
      </AnimatePresence>

      {/* Document PDF invisible pour la capture */}
      <ParchmentPdfDocument
        ref={pdfRef}
        data={{
          userName,
          totemName,
          totemImage,
          subtitle,
          sections,
        }}
      />
    </div>
  );
}
