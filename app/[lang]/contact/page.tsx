import type { Metadata } from "next";
import Contact from "@/components/sections/Contact";
import { getDictionary, type Locale } from "../dictionaries";
import { baseOpenGraph, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { title, description } = dict.seo.contact;

  return {
    title,
    description,
    alternates: pageAlternates(lang, "/contact"),
    openGraph: { ...baseOpenGraph(lang, dict.seo.siteName), title, description, url: `/${lang}/contact` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Contact dict={dict.contact} lang={lang} />;
}
