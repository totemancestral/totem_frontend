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
    title: dict.confidentialite.title,
    description: dict.confidentialite.subtitle,
    alternates: pageAlternates(lang, "/confidentialite"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title: dict.confidentialite.title, description: dict.confidentialite.subtitle, url: `/${lang}/confidentialite` },
    twitter: { ...baseTwitter(lang), title: dict.confidentialite.title, description: dict.confidentialite.subtitle },
  };
}

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <LegalPage dict={dict.confidentialite} lang={lang} />;
}
