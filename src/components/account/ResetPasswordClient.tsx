"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/renovare_clavis`,
      });

      if (resetError) throw resetError;

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
      setTimeout(() => router.replace(`/${locale}/janua_vitae`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.defaultError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="flex min-h-[100svh] items-center justify-center px-5 pb-20 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto flex w-full max-w-[480px] flex-col gap-7 rounded-lg border p-6 md:p-8"
        style={{ background: "rgba(26,26,46,0.78)", borderColor: "rgba(201,168,76,0.28)" }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(201,168,76,0.35)", color: "var(--or-ancestral)" }}
          >
            {phase === "request" ? <Mail size={21} /> : <KeyRound size={21} />}
          </div>
          <div>
            <h1 className="h-display text-4xl" style={{ color: "var(--or-ancestral)" }}>
              {phase === "request" ? t.requestTitle : t.updateTitle}
            </h1>
            <p className="body-copy mt-3" style={{ color: "rgba(254,252,240,0.72)" }}>
              {phase === "request" ? t.requestText : t.updateText}
            </p>
          </div>
        </div>

        <form
          onSubmit={phase === "request" ? requestReset : updatePassword}
          className="flex flex-col gap-4"
        >
          {phase === "request" ? (
            <Field
              label={t.email}
              value={email}
              onChange={setEmail}
              placeholder={t.emailPlaceholder}
              type="email"
              autoComplete="email"
              required
            />
          ) : (
            <Field
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

        <Link href={`/${locale}/janua_vitae`} className="btn-secondary w-full !px-4">
          <ArrowLeft size={16} />
          {t.back}
        </Link>
      </motion.div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  minLength,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="caption uppercase" style={{ color: "rgba(237,217,154,0.78)" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="form-input"
      />
    </label>
  );
}
