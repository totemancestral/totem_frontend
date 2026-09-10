import Profil from "@/components/sections/Profil";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Profil dict={dict.profil} lang={lang} />;
}
