import { Suspense } from "react";
import Confirmation from "@/components/sections/Confirmation";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Confirmation dict={dict.confirmation} offerName={dict.paiement.adulte.offerName} lang={lang} />
    </Suspense>
  );
}
