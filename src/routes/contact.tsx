import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Totem Ancestral" },
      { name: "description", content: "Écrivez à la maison Totem Ancestral. Réponse sous 48h." },
      { property: "og:title", content: "Contact — Totem Ancestral" },
      { property: "og:description", content: "Écrivez à la maison Totem Ancestral. Réponse sous 48h." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero
        title="Écrire à la maison"
        subtitle="Pour toute question, toute demande, toute confidence."
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-xl mx-auto">
          {sent ? (
            <div className="card-totem text-center">
              <p className="quote-italic text-xl mb-4">Votre message est parti.</p>
              <p className="text-sm" style={{ color: "var(--ivoire)" }}>
                Nous vous répondrons sous 48 heures.
              </p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="caption uppercase mb-2 block">Prénom</label>
                  <input required className="form-input" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="caption uppercase mb-2 block">Email</label>
                  <input required type="email" className="form-input" placeholder="vous@exemple.com" />
                </div>
              </div>
              <div>
                <label className="caption uppercase mb-2 block">Numéro d'œuvre (optionnel)</label>
                <input className="form-input" placeholder="N°…" />
              </div>
              <div>
                <label className="caption uppercase mb-2 block">Sujet</label>
                <input required className="form-input" placeholder="L'objet de votre message" />
              </div>
              <div>
                <label className="caption uppercase mb-2 block">Message</label>
                <textarea required rows={6} className="form-input" placeholder="Écrivez-nous…" />
              </div>
              <button type="submit" className="btn-primary mt-4">Envoyer</button>
              <p className="caption text-center mt-4">
                Ou écrivez directement à{" "}
                <a href="mailto:contact@totemancestral.com" className="link-gold">
                  contact@totemancestral.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
