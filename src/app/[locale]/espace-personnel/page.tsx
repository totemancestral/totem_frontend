import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Espace personnel - Totem Ancestral",
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Espace personnel"
        subtitle="Consultation des commandes et livrables - module M6."
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-xl mx-auto card-totem text-center">
          <p className="quote-italic text-lg">
            La protection Supabase et les URLs R2 seront ajoutees apres Stripe.
          </p>
        </div>
      </section>
    </>
  );
}
