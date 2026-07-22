"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authPath } from "@/lib/routes";
import { AuthField } from "./AuthField";

type Locale = "fr" | "en";
type Phase = "request" | "update";

const copy = {
  fr: {
    requestTitle: "Mot de passe oublie",
    updateTitle: "Nouveau mot de passe",
    requestText: "Entre ton email pour recevoir un lien de reinitialisation securise.",
    updateText: "Choisis un nouveau mot de passe pour rouvrir ton espace personnel.",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    password: "Nouveau mot de passe",
    passwordPlaceholder: "Minimum 6 caracteres",
    send: "Envoyer le lien",
    update: "Mettre a jour",
    sent: "Lien envoye. Verifie ta boite mail.",
    updated: "Mot de passe mis a jour. Redirection vers la connexion...",
    back: "Retour a la connexion",
    loading: "...",
    defaultError: "Operation impossible pour le moment.",
  },
  en: {
    requestTitle: "Forgot password",
    updateTitle: "New password",
    requestText: "Enter your email to receive a secure reset link.",
    updateText: "Choose a new password to reopen your personal space.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "New password",
    passwordPlaceholder: "Minimum 6 characters",
    send: "Send reset link",
    update: "Update password",
    sent: "Link sent. Check your inbox.",
    updated: "Password updated. Redirecting to sign in...",
    back: "Back to sign in",
    loading: "...",
    defaultError: "Operation failed right now.",
  },
} as const;

export function ResetPasswordClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = copy[locale];
  const [phase, setPhase] = useState<Phase>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setPhase("update");
  }, []);

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || t.defaultError);
      }

      setNotice(t.sent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.defaultError);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setNotice(t.updated);
      setTimeout(() => router.replace(authPath(locale, "signin")), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.defaultError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="premium-page flex w-full items-center justify-center overflow-hidden px-5 py-8 md:h-[100svh] md:px-10 md:py-10"
      style={{ background: "var(--nuit-profonde)", minHeight: "100svh" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/totem-logo.png" alt="" />
      </div>

      {/* Halo doré subtil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(216,173,77,0.42), transparent 60%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="premium-panel-strong mx-auto flex w-full max-w-[480px] flex-col gap-7 p-6 md:p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="premium-icon-box">
            {phase === "request" ? <Mail size={21} /> : <KeyRound size={21} />}
          </div>
          <div>
            <h1 className="h-display text-4xl" style={{ color: "var(--ivoire)" }}>
              {phase === "request" ? t.requestTitle : t.updateTitle}
            </h1>
            <p className="body-copy mt-3 premium-muted">
              {phase === "request" ? t.requestText : t.updateText}
            </p>
          </div>
        </div>

        <form
          onSubmit={phase === "request" ? requestReset : updatePassword}
          className="flex flex-col gap-4"
        >
          {phase === "request" ? (
            <AuthField
              label={t.email}
              value={email}
              onChange={setEmail}
              placeholder={t.emailPlaceholder}
              type="email"
              autoComplete="email"
              required
            />
          ) : (
            <AuthField
              label={t.password}
              value={password}
              onChange={setPassword}
              placeholder={t.passwordPlaceholder}
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          )}

          {error && (
            <p className="text-center text-sm" style={{ color: "#E07A6B" }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="text-center text-sm" style={{ color: "var(--or-pale)" }}>
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? t.loading : phase === "request" ? t.send : t.update}
          </button>
        </form>

        <Link href={authPath(locale, "signin")} className="btn-secondary w-full !px-4">
          <ArrowLeft size={16} />
          {t.back}
        </Link>
      </motion.div>
    </section>
  );
}

