import type { Metadata } from "next";
import { Suspense } from "react";
import { ParcoursPage } from "@/components/questionnaire/ParcoursPage";

export const metadata: Metadata = {
  title: "Le Parcours du Griot · Totem Ancestral",
  description:
    "Un questionnaire conversationnel en 10 questions pour composer ton œuvre ancestrale.",
};

export default function Page() {
  return (
    <Suspense fallback={<JourneyFallback />}>
      <ParcoursPage />
    </Suspense>
  );
}

function JourneyFallback() {
  return (
    <main
      className="flex min-h-[100svh] items-center justify-center px-5"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      Chargement…
    </main>
  );
}
