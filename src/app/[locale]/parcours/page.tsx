import type { Metadata } from "next";
import { ParcoursPage } from "@/components/questionnaire/ParcoursPage";

export const metadata: Metadata = {
  title: "Le Parcours du Griot - Totem Ancestral",
  description:
    "Un questionnaire conversationnel en 10 questions pour composer ton oeuvre ancestrale.",
};

export default function Page() {
  return <ParcoursPage />;
}
