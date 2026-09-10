import type { Metadata } from "next";
import ConsultationTirage from "@/components/sections/ConsultationTirage";
import { getDictionary, type Locale } from "../dictionaries";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ConsultationTiragePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ConsultationTirage dict={dict.consultationTirage} lang={lang} />;
}
