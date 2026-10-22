import ChoisirOffre from "@/components/sections/ChoisirOffre";
import { Suspense } from "react";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ChoisirOffrePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Suspense fallback={null}><ChoisirOffre dict={dict.paiement} offresDict={dict.offres} lang={lang} /></Suspense>;
}
