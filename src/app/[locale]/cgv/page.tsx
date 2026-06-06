import type { Metadata } from "next";
import { CGVPage } from "@/components/pages/CGVPage";

export const metadata: Metadata = {
  title: "CGV - Totem Ancestral",
  description: "Conditions générales de vente de Totem Ancestral.",
};

export default function Page() {
  return <CGVPage />;
}
