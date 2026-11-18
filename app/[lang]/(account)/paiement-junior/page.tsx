import { JuniorParentRequest } from "@/components/sections/JuniorParentRequest";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function PaiementJuniorPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <JuniorParentRequest copy={dict.parental} lang={lang} />;
}
