import type { Metadata } from "next";
import { DashboardClient } from "@/components/account/DashboardClient";

export const metadata: Metadata = {
  title: "Mes œuvres · Totem Ancestral",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DashboardClient locale={toLocale(locale)} section="artworks" />;
}

function toLocale(locale: string) {
  return locale === "en" ? "en" : "fr";
}
