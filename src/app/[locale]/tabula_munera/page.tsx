import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Les offres · Totem Ancestral",
  description: "Trois manières de recevoir l'œuvre Totem Ancestral, comparées en détail.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}#offres`);
}
