import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountActivated } from "@/components/account/AccountActivated";

export const metadata: Metadata = {
  title: "Compte activé · Totem Ancestral",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={null}>
      <AccountActivated locale={locale === "en" ? "en" : "fr"} />
    </Suspense>
  );
}
