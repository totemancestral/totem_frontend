import Commandes from "@/components/sections/Commandes";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function CommandesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Commandes dict={dict.commandes} lang={lang} />;
}
