"use client";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

// aligné sur l'ordre de dict.motDePasseOublie.legalLinks (CGV, Confidentialité, Mentions)
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

type Phase = "request" | "update";

export default function MotDePasseOublie({
  dict,
  lang,
}: {
  dict: Dictionary["motDePasseOublie"];
  lang: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const [phase, setPhase] = useState<Phase>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Le lien de réinitialisation ramène ici avec ?token_hash=...&type=recovery
  // (format maison, sans jamais passer par le domaine supabase.co) : on
  // vérifie nous-mêmes le jeton pour ouvrir une session avant d'afficher le
  // formulaire de nouveau mot de passe.
  useEffect(() => {
    if (tokenHash) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }).then(({ error: verifyError }) => {
        if (verifyError) {
          setError("Ce lien n'est plus valide ou a déjà été utilisé. Refais une demande.");
          return;
        }
        setPhase("update");
      });
      return;
    }
    // Compatibilité avec d'anciens emails déjà envoyés avant ce changement de
    // format : ceux-là ramènent encore le jeton dans le hash de l'URL.
    if (window.location.hash.includes("type=recovery")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur lue depuis window.location, inconnue au rendu serveur/statique
      setPhase("update");
    }
  }, [tokenHash]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Envoi impossible");
      setNotice(dict.sentNotice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setNotice(dict.updatedNotice);
      setTimeout(() => router.replace(`/${lang}/connexion`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setLoading(false);
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
        <form
          onSubmit={phase === "request" ? requestReset : updatePassword}
          className="flex w-full max-w-lg flex-col gap-7"
        >
          <div className="flex flex-col gap-7">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <div>
              <h1 className="font-display text-5xl text-ivoire">
                {phase === "request" ? dict.requestTitle : dict.updateTitle}
              </h1>
              <p className="mt-3.5 max-w-sm text-sm text-gris">
                {phase === "request" ? dict.requestText : dict.updateText}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {phase === "request" ? (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.emailPlaceholder}
                  autoComplete="email"
                  required
                  maxLength={255}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
            ) : (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.passwordLabel}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
                />
              </label>
            )}
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
              {loading ? "…" : phase === "request" ? dict.sendButton : dict.updateButton}
            </Button>
          </div>

          <Link href={`/${lang}/connexion`} className="text-sm text-or">
            {dict.backLink}
          </Link>

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
