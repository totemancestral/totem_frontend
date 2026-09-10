import type { Metadata } from "next";
import Admin from "@/components/sections/Admin";
import type { Locale } from "../dictionaries";

// Tableau de bord admin : jamais indexé, jamais suivi.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  return <Admin lang={lang} />;
}
