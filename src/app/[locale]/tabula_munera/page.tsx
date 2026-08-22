import type { Metadata } from "next";
import { OffersPage } from "@/components/pages/OffersPage";

export const metadata: Metadata = {
  title: "Les offres · Totem Ancestral",
  description: "Trois manières de recevoir l'œuvre Totem Ancestral, comparées en détail.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <OffersPage locale={locale} />;
}
