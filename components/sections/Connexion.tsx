"use client";
import { useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

// aligné sur l'ordre de dict.connexion.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#D8D0BC",
  "--color-or": "#B08A3E",
  "--color-orpale": "#8B6F2E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#948C78",
} as CSSProperties;

export default function Connexion({ dict, lang }: { dict: Dictionary["connexion"]; lang: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || `/${lang}/parcours`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? translateAuthError(err.message) : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      setError(dict.magicLinkEmailRequired);
      return;
    }
    setSendingMagicLink(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
      if (!response.ok) throw new Error();
      setNotice(dict.magicLinkSent);
    } catch {
      setError("Envoi impossible. Réessaie dans un instant.");
    } finally {
      setSendingMagicLink(false);
    }
  }

  return (
    <div className="flex min-h-screen items-stretch">
      {/* panneau photo : réservé au bureau */}
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-nuit lg:block [perspective:1200px]">
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

      {/* panneau formulaire : palette ivoire réchauffé */}
      <div
        className="flex flex-1 items-center justify-center px-6 py-20 lg:px-20"
        style={ivoireScope}
      >
        <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-7">

          <div className="flex flex-col gap-7">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <div>
              <h1 className="font-display text-5xl text-ivoire">{dict.title}</h1>
              <p className="mt-3.5 text-xs font-medium uppercase tracking-wide text-gris">
                {dict.subtitle}
              </p>
            </div>
            <p className="font-display text-xl italic leading-snug text-orpale">
              {dict.quoteLine1}
              <br />
              {dict.quoteLine2}
            </p>
          </div>

          {/* formulaire */}
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.emailPlaceholder}
                autoComplete="email"
                required
                maxLength={255}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.passwordLabel}</span>
                <Link href={`/${lang}/mot-de-passe-oublie`} className="text-xs text-or">
                  {dict.forgotPassword}
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                maxLength={128}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
              />
            </label>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#B0473E" }} role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-orpale" role="status">
              {notice}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={loading} className="disabled:cursor-wait disabled:opacity-60">
              {loading ? "…" : dict.submit}
            </Button>
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={sendingMagicLink}
              className="text-sm font-medium text-or disabled:opacity-60"
            >
              {sendingMagicLink ? "…" : dict.magicLink}
            </button>
          </div>

          <p className="text-sm text-grisclair">
            {dict.signupLine}{" "}
            <Link href={`/${lang}/inscription`} className="text-or">
              {dict.signupLink}
            </Link>
          </p>

          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex gap-6">
              {dict.legalLinks.map((lien, i) => (
                <Link key={lien} href={`/${lang}${legalHrefs[i]}`} className="text-sm text-grisclair">
                  {lien}
                </Link>
              ))}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirme ton email avant de te connecter.";
  if (/rate limit/i.test(message)) return "Trop de tentatives. Réessaie dans quelques minutes.";
  return message;
}
