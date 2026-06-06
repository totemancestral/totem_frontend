import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe - Totem Ancestral",
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Réinitialisation"
        subtitle="Cette route sera connectée à Supabase Auth dans le module M6."
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-xl mx-auto card-totem text-center">
          <p className="quote-italic text-lg">
            Authentification en cours de migration vers l'architecture cible.
          </p>
        </div>
      </section>
    </>
  );
}
