import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupClient } from "@/components/account/SignupClient";

export const metadata: Metadata = {
  title: "Creer mon compte · Totem Ancestral",
  description:
    "Ouvre ton passage : crée ton compte pour composer ton œuvre et retrouver tes livrables dans ton espace personnel.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignupClient locale={locale === "en" ? "en" : "fr"} />
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
