import EspaceOeuvres from "@/components/sections/EspaceOeuvres";
import { getDictionary, type Locale } from "../../dictionaries";

export default async function OeuvresPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <EspaceOeuvres dict={dict.espaceOeuvres} lang={lang} />;
}
