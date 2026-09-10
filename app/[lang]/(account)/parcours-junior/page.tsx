import { Suspense } from "react";
import ParcoursGriot from "@/components/sections/ParcoursGriot";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ParcoursJuniorPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <ParcoursGriot dict={dict.parcours} lang={lang} variant="junior" />
    </Suspense>
  );
}
