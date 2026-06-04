import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Acces - Totem Ancestral",
};

export default function Page() {
  return (
    <>
      <PageHero title="Acces" subtitle="Le module Supabase Auth sera branche dans l'etape M6." />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-xl mx-auto card-totem text-center">
          <p className="quote-italic text-lg mb-6">
            L'espace personnel arrive dans la prochaine tranche.
          </p>
          <Link href="/fr/parcours" className="btn-primary">
            Composer une oeuvre
          </Link>
        </div>
      </section>
    </>
  );
}
