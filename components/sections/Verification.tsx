"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

// aligné sur l'ordre de dict.verification.legalLinks (CGV, Confidentialité, Mentions)
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

const VERIFIABLE_TYPES = ["signup", "magiclink", "email_change"] as const;
type VerifiableType = (typeof VERIFIABLE_TYPES)[number];

function readVerifiableType(value: string | null): VerifiableType {
  return (VERIFIABLE_TYPES as readonly string[]).includes(value ?? "") ? (value as VerifiableType) : "signup";
}

export default function Verification({ dict, lang }: { dict: Dictionary["verification"]; lang: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || `/${lang}/parcours`;
  const email = searchParams.get("email") ?? "";
  const tokenHash = searchParams.get("token_hash");
  const otpType = readVerifiableType(searchParams.get("type"));

  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState(false);

  useEffect(() => {
    // Lien au format maison (?token_hash=...&type=...) : on vérifie
    // nous-mêmes le jeton, sans jamais passer par le domaine supabase.co.
    if (tokenHash) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType }).then(async ({ data, error }) => {
        if (error) {
          setVerifyError(true);
          return;
        }
        // Le changement d'email n'est confirmé qu'au niveau Auth : on
        // resynchronise nous-mêmes profiles.email (aucun trigger ne le fait).
        if (otpType === "email_change" && data.session) {
          await fetch("/api/profil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
            body: JSON.stringify({}),
          }).catch(() => undefined);
        }
        router.replace(nextPath);
      });
      return;
    }

    // Compatibilité avec d'anciens emails déjà envoyés avant ce changement de
    // format : ceux-là ramènent encore les jetons Supabase dans l'URL, que le
    // SDK détecte automatiquement (detectSessionInUrl) et déclenche SIGNED_IN.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.replace(nextPath);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(nextPath);
    });
    return () => subscription.subscription.unsubscribe();
  }, [nextPath, router, tokenHash, otpType]);

  async function resend() {
    if (!email) return;
    setResending(true);
    setNotice(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setNotice(error ? "Envoi impossible. Réessaie dans un instant." : "Email renvoyé.");
    setResending(false);
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

      {/* panneau message : palette ivoire réchauffé */}
      <div
        className="flex flex-1 items-center justify-center px-6 py-20 lg:px-20"
        style={ivoireScope}
      >
        <div className="flex w-full max-w-lg flex-col items-start gap-7">

          <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>

          {/* enveloppe */}
          <svg width="48" height="34" viewBox="0 0 56 40" fill="none" stroke="#B08A3E" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <rect x="1" y="1" width="54" height="38" />
            <polyline points="1,3 28,24 55,3" />
          </svg>

          <div>
            <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
            <p className="mt-3.5 text-xs font-medium uppercase tracking-wide text-gris">
              {dict.subtitle}
            </p>
          </div>

          <p className="font-display text-xl italic leading-snug text-orpale">
            {dict.quoteLine1}
            <br />
            {dict.quoteLine2}
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-gris">{dict.emailIntro}</p>
            {email && <p className="text-lg font-semibold text-ivoire">{email}</p>}
            <p className="mt-1.5 text-sm leading-relaxed text-gris">{dict.text}</p>
          </div>

          {verifyError && (
            <p className="text-sm" style={{ color: "#B0473E" }} role="alert">
              {dict.linkExpired}
            </p>
          )}

          {notice && (
            <p className="text-sm text-orpale" role="status">
              {notice}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button variant="outline" onClick={resend} disabled={resending || !email}>
              {resending ? "…" : dict.resendButton}
            </Button>
            <Link href={`/${lang}/inscription`} className="border-b border-or text-sm font-medium text-or pb-0.5">
              {dict.changeEmailLink}
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            <div className="flex gap-6">
              {dict.legalLinks.map((lien, i) => (
                <Link key={lien} href={`/${lang}${legalHrefs[i]}`} className="text-sm text-grisclair">
                  {lien}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
