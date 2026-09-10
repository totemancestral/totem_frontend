import type { Metadata } from "next";
import LaMaisonPage from "@/components/sections/LaMaisonPage";
import { getDictionary, type Locale } from "../../dictionaries";
import { baseOpenGraph, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { title, description } = dict.seo.laMaison;

  return {
    title,
    description,
    alternates: pageAlternates(lang, "/la-maison"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title, description, url: `/${lang}/la-maison` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LaMaisonRoute({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <LaMaisonPage dict={dict.laMaisonPage} />;
}
