import { Suspense } from "react";
import Connexion from "@/components/sections/Connexion";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ConnexionPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={null}>
      <Connexion dict={dict.connexion} lang={lang} />
    </Suspense>
  );
}
