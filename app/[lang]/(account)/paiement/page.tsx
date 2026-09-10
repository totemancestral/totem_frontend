import { Suspense } from "react";
import Paiement from "@/components/sections/Paiement";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function PaiementPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Paiement dict={dict.paiement} lang={lang} variant="adulte" />
    </Suspense>
  );
}
