import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FAQ · Totem Ancestral",
  description: "Questions fréquentes sur l'expérience Totem Ancestral.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}#faq`);
}
