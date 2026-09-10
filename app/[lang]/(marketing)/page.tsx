import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import AvantDetreVous from "@/components/sections/AvantDetreVous";
import ApresLeTotem from "@/components/sections/ApresLeTotem";
import Manifeste from "@/components/sections/Manifeste";
import LeSeuil from "@/components/sections/LeSeuil";
import Offres from "@/components/sections/Offres";
import LaMaison from "@/components/sections/LaMaison";
import Temoignages from "@/components/sections/Temoignages";
import Faq from "@/components/sections/Faq";
import CtaFinal from "@/components/sections/CtaFinal";
import { getDictionary, type Locale } from "../dictionaries";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: pageAlternates(lang, "") };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict.hero} lang={lang} />
      <AvantDetreVous dict={dict.avantDetreVous} />
      <ApresLeTotem dict={dict.apresLeTotem} lang={lang} />
      <Manifeste dict={dict.manifeste} />
      <LeSeuil dict={dict.leSeuil} />
      <Offres dict={dict.offres} lang={lang} />
      <LaMaison dict={dict.laMaison} lang={lang} />
      <Temoignages dict={dict.temoignages} />
      <Faq dict={dict.faq} lang={lang} />
      <CtaFinal dict={dict.ctaFinal} lang={lang} />
    </>
  );
}
