"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Inscription obligatoire au TOTP pour tout compte admin qui n'en a pas
 * encore. Tant que ce n'est pas fait, le tableau de bord reste inaccessible
 * (voir Admin.tsx) — la 2FA n'est pas optionnelle pour ce rôle.
 */
export function MfaEnroll({ onEnrolled }: { onEnrolled: () => void }) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (!alive) return;
      if (enrollError || !data) {
        setError("Impossible de démarrer l'inscription 2FA.");
        setLoading(false);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!factorId) return;
    setVerifying(true);
    setError(null);

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

    onEnrolled();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-nuit px-6 py-16 text-center">
      <div className="flex max-w-md flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-or">Sécurité obligatoire</p>
        <h1 className="font-display text-3xl text-ivoire">Active la double authentification</h1>
        <p className="text-sm text-grisclair">
          L&apos;accès au tableau de bord admin exige un second facteur. Scanne ce code avec Google
          Authenticator, 1Password ou une app équivalente.
        </p>
      </div>

      {loading && <p className="text-sm text-grisclair">Génération du code…</p>}

      {!loading && qrCode && (
        <form onSubmit={verify} className="flex w-full max-w-xs flex-col items-center gap-5">
          <div
            className="border border-ombre bg-ivoire p-3"
            // Contenu SVG renvoyé par Supabase lui-même, pas une entrée utilisateur.
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
          {secret && (
            <p className="break-all text-xs text-grisclair">
              Ou saisis la clé manuellement : <span className="text-or">{secret}</span>
            </p>
          )}

          <label className="flex w-full flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-grisclair">
              Code à 6 chiffres
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="border border-ombre bg-indigo px-4 py-3 text-center text-lg tracking-[0.3em] text-ivoire"
            />
          </label>

          {error && (
            <p className="text-sm" style={{ color: "#E0A99B" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={code.length !== 6 || verifying}
            className="w-full border border-or px-6 py-3 text-sm uppercase tracking-wide text-or transition-colors hover:bg-or hover:text-nuit disabled:opacity-40"
          >
            {verifying ? "…" : "Activer"}
          </button>
        </form>
      )}

      {error && !qrCode && (
        <p style={{ color: "#E0A99B" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
