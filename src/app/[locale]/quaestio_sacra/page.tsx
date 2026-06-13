import type { Metadata } from "next";
import { FAQPage } from "@/components/pages/FAQPage";

export const metadata: Metadata = {
  title: "FAQ - Totem Ancestral",
  description: "Questions fréquentes sur l'expérience Totem Ancestral.",
};

export default function Page() {
  return <FAQPage />;
}
