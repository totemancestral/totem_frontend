"use client";
import { useState, type FormEvent } from "react";
import { PageHero } from "@/components/PageHero";

export function ContactForm() {
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
      consentement: true,
    };

    try {
      const res = await fetch("/api/epistula_missa", {
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

  if (status === "sent") {
    return (
      <div className="premium-panel-strong p-8 text-center">
        <p className="quote-italic mb-4 text-xl">Votre message est parti.</p>
        <p className="text-sm" style={{ color: "var(--ivoire)" }}>
          Nous vous répondrons sous 48 heures.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="caption mb-2 block uppercase" htmlFor="prenom">
            Prénom
          </label>
          <input
            id="prenom"
            name="prenom"
            required
            className="form-input"
            placeholder="Votre prénom"
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="caption mb-2 block uppercase" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            className="form-input"
            placeholder="vous@exemple.com"
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <label className="caption mb-2 block uppercase" htmlFor="sujet">
          Sujet
        </label>
        <input
          id="sujet"
          name="sujet"
          required
          className="form-input"
          placeholder="Commande, cadeau, livraison ou demande particulière"
        />
      </div>
      <div>
        <label className="caption mb-2 block uppercase" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          className="form-input"
          placeholder="Écrivez-nous votre demande. Plus le contexte est clair, plus la réponse sera juste."
        />
      </div>
      {status === "error" && (
        <p className="text-sm" style={{ color: "#E07A6B" }}>
          {errorMsg}
        </p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary mt-2">
        {status === "sending" ? "Envoi en cours..." : "Envoyer"}
      </button>
      <p className="caption text-center leading-relaxed">
        Ou écrivez directement à{" "}
        <a href="mailto:contact@totemancestral.com" className="link-gold">
          contact@totemancestral.com
        </a>
      </p>
    </form>
  );
}

export function ContactSection({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id="contact"
      className={`premium-page ${compact ? "px-5 py-24 md:px-10" : "pb-24 px-5 md:px-10"}`}
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
        <div className="flex flex-col gap-6">
          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            Contact
          </p>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--ivoire)" }}>
            Écrire à la maison
          </h2>
          <p className="quote-italic text-lg md:text-xl">
            Pour une question, une commande, un cadeau ou une confidence avant la traversée.
          </p>
          <div
            className="space-y-4 text-[15px] leading-[1.8]"
            style={{ color: "rgba(254,252,240,0.78)" }}
          >
            <p>Réponse habituelle sous 48 heures ouvrées.</p>
            <p>
              Pour une commande existante, indiquez l'email utilisé et le numéro d'œuvre si vous
              l'avez déjà reçu.
            </p>
          </div>
        </div>
        <div className="premium-panel-strong p-6 md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHero
        title="Écrire à la maison"
        subtitle="Pour toute question, toute demande, toute confidence."
      />
      <ContactSection />
    </>
  );
}
