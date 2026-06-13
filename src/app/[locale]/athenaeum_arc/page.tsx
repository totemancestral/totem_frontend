import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "À propos - Totem Ancestral",
  description: "Le manifeste de la maison Totem Ancestral.",
};

export default function Page() {
  return <AboutPage />;
}
