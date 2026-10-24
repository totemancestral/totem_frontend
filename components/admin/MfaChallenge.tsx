"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

/** Demande le code TOTP courant pour faire passer la session en aal2. */
export function MfaChallenge({ factorId, onVerified }: { factorId: string; onVerified: () => void }) {
  const { t, lang } = useAdminLocale();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setVerifying(true);
    setError(null);
    try {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setError("Code invalide, réessaie.");
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError("Code invalide, réessaie.");
      setVerifying(false);
      return;
    }

    onVerified();
    } catch { setError("Vérification indisponible. Réessaie dans un instant."); }
    finally { setVerifying(false); }
  }

  return (
    <div lang={lang} className="flex min-h-screen flex-col items-center justify-center gap-7 bg-nuit px-6 py-12 text-center">
      <div className="flex max-w-sm flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{t("Vérification en deux étapes")}</p>
        <h1 className="font-display text-3xl text-ivoire">{t("Ton code de sécurité")}</h1>
        <p className="text-sm text-grisclair">{t("Ouvre ton application d'authentification pour continuer.")}</p>
      </div>

      <p role="status" className="sr-only">{verifying ? t("Vérification du code…") : ""}</p>
      <form onSubmit={verify} aria-busy={verifying} className="flex w-full max-w-xs flex-col items-center gap-5">
        <label className="flex w-full flex-col gap-2">
          <span className="text-sm text-grisclair">{t("Code de vérification à 6 chiffres")}</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            required
            pattern="[0-9]{6}"
            aria-describedby={error ? "mfa-code-error" : undefined}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full border border-ombre bg-indigo px-4 py-3 text-center text-lg tracking-[0.3em] text-ivoire"
          />
        </label>

        {error && (
          <p id="mfa-code-error" ref={errorRef} tabIndex={-1} className="text-sm focus:outline-2 focus:outline-offset-4 focus:outline-or" style={{ color: "#E0A99B" }} role="alert">
            {t(error)}
          </p>
        )}

        <button
          type="submit"
          disabled={code.length !== 6 || verifying}
          className="w-full border border-or px-6 py-3 text-sm uppercase tracking-wide text-or transition-colors hover:bg-or hover:text-nuit disabled:opacity-40"
        >
          {verifying ? t("Vérification du code…") : t("Valider")}
        </button>
      </form>
    </div>
  );
}
