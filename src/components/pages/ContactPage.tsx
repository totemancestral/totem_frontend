"use client";
import { useState, type FormEvent } from "react";
import { PageHero } from "@/components/PageHero";

export function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      prenom: (form.elements.namedItem("prenom") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      sujet: (form.elements.namedItem("sujet") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? "Erreur d'envoi");
      }

      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "Erreur inconnue");
    }
  }

  return (
    <>
      <PageHero
        title="Écrire à la maison"
        subtitle="Pour toute question, toute demande, toute confidence."
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-xl mx-auto">
          {status === "sent" ? (
            <div className="card-totem text-center">
              <p className="quote-italic text-xl mb-4">Votre message est parti.</p>
              <p className="text-sm" style={{ color: "var(--ivoire)" }}>
                Nous vous répondrons sous 48 heures.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="caption uppercase mb-2 block" htmlFor="prenom">Prénom</label>
                  <input id="prenom" name="prenom" required className="form-input" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="caption uppercase mb-2 block" htmlFor="email">Email</label>
                  <input id="email" name="email" required type="email" className="form-input" placeholder="vous@exemple.com" />
                </div>
              </div>
              <div>
                <label className="caption uppercase mb-2 block" htmlFor="sujet">Sujet</label>
                <input id="sujet" name="sujet" required className="form-input" placeholder="L'objet de votre message" />
              </div>
              <div>
                <label className="caption uppercase mb-2 block" htmlFor="message">Message</label>
                <textarea id="message" name="message" required rows={6} className="form-input" placeholder="Écrivez-nous…" />
              </div>
              {status === "error" && (
                <p className="text-sm" style={{ color: "#E07A6B" }}>{errorMsg}</p>
              )}
              <button type="submit" disabled={status === "sending"} className="btn-primary mt-4">
                {status === "sending" ? "Envoi en cours..." : "Envoyer"}
              </button>
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
