import { Suspense } from "react";
import MotDePasseOublie from "@/components/sections/MotDePasseOublie";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function MotDePasseOubliePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <MotDePasseOublie dict={dict.motDePasseOublie} lang={lang} />
    </Suspense>
  );
}
