import Espace from "@/components/sections/Espace";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function EspacePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Espace dict={dict.espace} lang={lang} />;
}
