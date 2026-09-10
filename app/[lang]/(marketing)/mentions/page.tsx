import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { getDictionary, type Locale } from "../../dictionaries";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.mentions.title,
    description: dict.mentions.subtitle,
    alternates: pageAlternates(lang, "/mentions"),
  };
}

export default async function MentionsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <LegalPage dict={dict.mentions} lang={lang} />;
}
