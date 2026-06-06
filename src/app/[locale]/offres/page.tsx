import type { Metadata } from "next";
import { OffersPage } from "@/components/pages/OffersPage";

export const metadata: Metadata = {
  title: "Les offres - Totem Ancestral",
  description: "Trois manières de recevoir l'œuvre Totem Ancestral, comparées en détail.",
};

export default function Page() {
  return <OffersPage />;
}
