import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { getDictionary, type Locale } from "../../dictionaries";
import { baseOpenGraph, baseTwitter, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.cgv.title,
    description: dict.cgv.subtitle,
    alternates: pageAlternates(lang, "/cgv"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title: dict.cgv.title, description: dict.cgv.subtitle, url: `/${lang}/cgv` },
    twitter: { ...baseTwitter(lang), title: dict.cgv.title, description: dict.cgv.subtitle },
  };
}

export default async function CgvPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <LegalPage dict={dict.cgv} lang={lang} />;
}
