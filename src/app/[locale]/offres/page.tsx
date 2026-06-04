import type { Metadata } from "next";
import { OffersPage } from "@/components/pages/OffersPage";

export const metadata: Metadata = {
  title: "Les offres - Totem Ancestral",
  description: "Trois manieres de recevoir l'oeuvre Totem Ancestral, comparees en detail.",
};

export default function Page() {
  return <OffersPage />;
}
