import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact · Totem Ancestral",
  description: "Écrivez à la maison Totem Ancestral. Réponse sous 48h.",
};

export default function Page() {
  return <ContactPage />;
}
