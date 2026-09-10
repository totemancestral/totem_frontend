import type { Metadata } from "next";
import FaqPage from "@/components/sections/FaqPage";
import { getDictionary, type Locale } from "../../dictionaries";
import { baseOpenGraph, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { title, description } = dict.seo.faq;

  return {
    title,
    description,
    alternates: pageAlternates(lang, "/faq"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title, description, url: `/${lang}/faq` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FaqRoute({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <FaqPage dict={dict.faqPage} />;
}
