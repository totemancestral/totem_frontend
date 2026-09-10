import { Suspense } from "react";
import Inscription from "@/components/sections/Inscription";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function InscriptionPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Inscription dict={dict.inscription} lang={lang} />
    </Suspense>
  );
}
