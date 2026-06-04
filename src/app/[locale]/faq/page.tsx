import type { Metadata } from "next";
import { FAQPage } from "@/components/pages/FAQPage";

export const metadata: Metadata = {
  title: "FAQ - Totem Ancestral",
  description: "Questions frequentes sur l'experience Totem Ancestral.",
};

export default function Page() {
  return <FAQPage />;
}
