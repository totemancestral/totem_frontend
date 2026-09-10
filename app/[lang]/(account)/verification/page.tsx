import { Suspense } from "react";
import Verification from "@/components/sections/Verification";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Verification dict={dict.verification} lang={lang} />
    </Suspense>
  );
}
