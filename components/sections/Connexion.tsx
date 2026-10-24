"use client";
import { interfaceCopy, authErrorMessage } from "@/lib/interface-copy";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import { PasswordField } from "@/components/ui/PasswordField";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { RetryAfterError, retryErrorNotice, retryNotice } from "@/lib/retry-after";

// aligné sur l'ordre de dict.connexion.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#857A63",
  "--color-or": "#806020",
  "--color-orpale": "#7B612E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#706655",
} as CSSProperties;

export default function Connexion({ dict, lang }: { dict: Dictionary["connexion"]; lang: Locale }) {
  const ui = interfaceCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = safeRedirectPath(searchParams.get("redirect"), lang);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (error) {
      if (emailError) emailRef.current?.focus();
      else errorRef.current?.focus();
    }
  }, [error, emailError]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(false);
    setNotice(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push(redirectPath);
    } catch (err) {
      setError(authErrorMessage(err, lang, "signInFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!emailRef.current?.checkValidity()) {
      setEmailError(true);
      setError(dict.magicLinkEmailRequired);
      emailRef.current?.reportValidity();
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
      if (retryNotice(response, lang)) throw new RetryAfterError(response);
      if (!response.ok) throw new Error();
      setNotice(dict.magicLinkSent);
    } catch (error) {
      setError(retryErrorNotice(error, lang) ?? ui.errors.sendFailed);
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
        className="flex min-w-0 flex-1 items-center justify-center px-6 py-20 lg:px-20"
        style={ivoireScope}
      >
        <p role="status" className="sr-only">{loading ? (ui.status.signingIn) : sendingMagicLink ? (ui.status.sendingLink) : ""}</p>
        <form onSubmit={onSubmit} aria-busy={loading || sendingMagicLink} className="flex w-full min-w-0 max-w-lg flex-col gap-7 [overflow-wrap:anywhere]">

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
                ref={emailRef}
                aria-invalid={emailError || undefined}
                aria-describedby={emailError && error ? "login-error" : undefined}
                type="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) { setEmailError(false); setError(null); } }}
                placeholder={dict.emailPlaceholder}
                autoComplete="email"
                required
                maxLength={255}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="connexion-password" className="text-xs font-medium uppercase tracking-wide text-gris">{dict.passwordLabel}</label>
                <Link href={`/${lang}/mot-de-passe-oublie`} className="text-xs text-or">
                  {dict.forgotPassword}
                </Link>
              </div>
              <PasswordField
                id="connexion-password"
                lang={lang}
                name="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </div>
          </div>

          {error && (
            <p id="login-error" ref={errorRef} tabIndex={-1} className="text-sm focus:outline-2 focus:outline-offset-4 focus:outline-or" style={{ color: "#B0473E" }} role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-orpale" role="status">
              {notice}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={loading || sendingMagicLink} className="hover:text-[#FEFCF0]! disabled:cursor-wait disabled:opacity-60">
              {loading ? (ui.status.signingIn) : dict.submit}
            </Button>
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={sendingMagicLink || loading}
              className="text-sm font-medium text-or disabled:opacity-60"
            >
              {sendingMagicLink ? (ui.status.sendingLink) : dict.magicLink}
            </button>
          </div>

          <p className="text-sm text-grisclair">
            {dict.signupLine}{" "}
            <Link href={`/${lang}/inscription`} className="text-or underline underline-offset-4">
              {dict.signupLink}
            </Link>
          </p>

          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
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
