import type { Metadata } from "next";
import { JuniorParcoursPage } from "@/components/questionnaire/JuniorParcoursPage";

export const metadata: Metadata = {
  title: "Totem Junior · Totem Ancestral",
  description: "Un parcours court en cinq choix pour révéler un totem Junior.",
};

export default function Page() {
  return <JuniorParcoursPage />;
}
