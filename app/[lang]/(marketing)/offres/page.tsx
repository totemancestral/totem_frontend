import type { Metadata } from "next";
import Offres from "@/components/sections/Offres";
import OffreJunior from "@/components/sections/OffreJunior";
import CeQueVousRecevez from "@/components/sections/CeQueVousRecevez";
import OffresComparatif from "@/components/sections/OffresComparatif";
import TotemVivant from "@/components/sections/TotemVivant";
import { getDictionary, type Locale } from "../../dictionaries";
import { baseOpenGraph, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { title, description } = dict.seo.offres;

  return {
    title,
    description,
    alternates: pageAlternates(lang, "/offres"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title, description, url: `/${lang}/offres` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function OffresPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Offres dict={dict.offres} lang={lang} />
      <OffresComparatif dict={dict.offresComparatif} />
      <TotemVivant dict={dict.totemVivant} />
      <OffreJunior dict={dict.offreJunior} lang={lang} />
      <CeQueVousRecevez dict={dict.ceQueVousRecevez} />
    </>
  );
}
