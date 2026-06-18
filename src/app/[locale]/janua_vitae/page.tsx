import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthClient } from "@/components/account/AuthClient";

export const metadata: Metadata = {
  title: "Accès · Totem Ancestral",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthClient locale={toLocale(locale)} />
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

function toLocale(locale: string) {
  return locale === "en" ? "en" : "fr";
}
