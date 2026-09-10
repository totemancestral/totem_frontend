import Consultations from "@/components/sections/Consultations";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function ConsultationsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <Consultations dict={dict.consultations} lang={lang} />;
}
