import type { Metadata } from "next";
import ConsultationQuestion from "@/components/sections/ConsultationQuestion";
import { getDictionary, type Locale } from "../dictionaries";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ConsultationQuestionPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ConsultationQuestion dict={dict.consultationQuestion} lang={lang} />;
}
