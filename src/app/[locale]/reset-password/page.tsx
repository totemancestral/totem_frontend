import type { Metadata } from "next";
import { ResetPasswordClient } from "@/components/account/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe - Totem Ancestral",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ResetPasswordClient locale={toLocale(locale)} />;
}

function toLocale(locale: string) {
  return locale === "en" ? "en" : "fr";
}
