"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// aligné sur l'ordre de dict.contact.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

export default function Contact({ dict, lang }: { dict: Dictionary["contact"]; lang: Locale }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, sujet, message }),
      });
      if (!response.ok) throw new Error();
      setStatus("sent");
      setPrenom("");
      setEmail("");
      setSujet("");
      setMessage("");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-nuit">
      {/* panneau photo : réservé au bureau */}
      <div className="relative hidden h-screen w-[42%] shrink-0 overflow-hidden bg-nuit lg:block [perspective:1200px]">
        <div className="absolute inset-0 animate-totem-3d [transform-style:preserve-3d]">
          <Image
            src="/images/logo_totem_1.svg"
            alt=""
            fill
            priority
            className="object-cover object-[50%_25%]"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-nuit/40 via-transparent to-nuit/50" />

        <Brand lang={lang} className="absolute left-14 top-12" />
      </div>

      {/* panneau formulaire : thème sombre, pas de teinte ivoire */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-20 lg:px-20">
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-6.5">

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <h1 className="font-display text-5xl text-ivoire">{dict.title}</h1>
            <p className="font-display mt-1 text-xl italic leading-snug text-orpale">{dict.quote}</p>
          </div>

          <p className="text-sm leading-relaxed text-grisclair">{dict.intro}</p>

          {/* formulaire */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.firstNameLabel}</span>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder={dict.firstNamePlaceholder}
                  required
                  maxLength={80}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.emailPlaceholder}
                  required
                  maxLength={255}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.subjectLabel}</span>
              <input
                type="text"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                placeholder={dict.subjectPlaceholder}
                required
                maxLength={200}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.messageLabel}</span>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={dict.messagePlaceholder}
                required
                minLength={10}
                maxLength={4000}
                className="resize-none border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>
          </div>

          {status === "sent" && (
            <p className="text-sm text-orpale" role="status">
              {dict.sentNotice}
            </p>
          )}
          {status === "error" && (
            <p className="text-sm" style={{ color: "#E07A6B" }} role="alert">
              {dict.errorNotice}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={loading} className="disabled:cursor-wait disabled:opacity-60">
              {loading ? "…" : dict.submit}
            </Button>
            <a href={`mailto:${dict.directEmail}`} className="border-b border-or text-sm font-medium text-or pb-0.5">
              {dict.directEmailPrefix}{dict.directEmail}
            </a>
          </div>

          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex gap-6">
              {dict.legalLinks.map((lien, i) => (
                <Link key={lien} href={`/${lang}${legalHrefs[i]}`} className="text-sm text-grisclair">
                  {lien}
                </Link>
              ))}
            </div>
            <p className="font-display mt-1 text-sm italic text-or">{dict.tagline}</p>
          </div>

        </form>
      </div>
    </div>
  );
}
