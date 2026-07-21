import type { Metadata } from "next";
import { Suspense } from "react";
import { SigninClient } from "@/components/account/SigninClient";

export const metadata: Metadata = {
  title: "Se connecter · Totem Ancestral",
  description:
    "Reviens dans ton espace : connecte-toi pour retrouver ton parcours, tes commandes et tes oeuvres.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={<AuthFallback />}>
      <SigninClient locale={locale === "en" ? "en" : "fr"} />
    </Suspense>
  );
}

function AuthFallback() {
  return (
    <section
      className="min-h-[100svh] px-5 pb-20 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div
        className="mx-auto max-w-xl rounded-lg border p-8 text-center"
        style={{ borderColor: "rgba(201,168,76,0.22)" }}
      >
        <p className="quote-italic">Chargement...</p>
      </div>
    </section>
  );
}
