import { Suspense } from "react";
import type { Metadata } from "next";
import Oeuvre from "@/components/sections/Oeuvre";
import { getDictionary, type Locale } from "../dictionaries";

// Page de révélation d'une œuvre précise : contenu personnel, sans valeur
// de référencement.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OeuvrePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Oeuvre dict={dict.oeuvre} lang={lang} />
    </Suspense>
  );
}
