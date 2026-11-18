import type { Metadata } from "next";
import { ParentConfirmation } from "@/components/sections/ParentConfirmation";
import { getDictionary, type Locale } from "../../dictionaries";

export const metadata: Metadata = { title: "Totem Junior", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const copy = await getDictionary(lang);
  return <ParentConfirmation copy={copy.parental} lang={lang} />;
}
