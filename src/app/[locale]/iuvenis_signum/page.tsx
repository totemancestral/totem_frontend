import type { Metadata } from "next";
import { Suspense } from "react";
import { JuniorParcoursPage } from "@/components/questionnaire/JuniorParcoursPage";

export const metadata: Metadata = {
  title: "Totem Junior · Totem Ancestral",
  description: "Un parcours court en cinq choix pour révéler un totem Junior.",
};

export default function Page() {
  return (
    <Suspense fallback={<JuniorFallback />}>
      <JuniorParcoursPage />
    </Suspense>
  );
}

function JuniorFallback() {
  return (
    <main
      className="flex min-h-[100svh] items-center justify-center px-5"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      Chargement…
    </main>
  );
}
