"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";

type Locale = "fr" | "en";
type Mode = "signin" | "signup";

const copy = {
  fr: {
    eyebrow: "Acces personnel",
    signinTitle: "Revenir dans ton espace",
    signupTitle: "Creer ton espace",
    signinText: "Connecte-toi pour retrouver ton parcours, tes commandes et tes oeuvres.",
    signupText:
      "Cree ton compte pour commencer la composition. Ton parcours sera rattache a cet espace.",
    firstName: "Prenom",
    firstNamePlaceholder: "Ton prenom",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "Minimum 6 caracteres",
    signin: "Entrer",
    signup: "Creer mon compte",
    magic: "Recevoir un lien magique",
    forgot: "Mot de passe oublie",
    site: "Entrer sur le site",
    switchSignup: "Je viens composer mon oeuvre",
    switchSignin: "J'ai deja un compte",
    legal: "Tes donnees restent rattachees a ton compte et protegees par Supabase Auth.",
    magicSent: "Lien magique envoye. Verifie ta boite mail.",
    sessionReady: "Session ouverte. Redirection...",
    authError: "Authentification impossible.",
    loading: "...",
    checks: ["Parcours sauvegarde", "Livrables rattaches", "Retour securise"],
  },
  en: {
    eyebrow: "Personal access",
    signinTitle: "Return to your space",
    signupTitle: "Create your space",
    signinText: "Sign in to find your journey, orders and artworks.",
    signupText:
      "Create your account to start composing. Your journey will be attached to this space.",
    firstName: "First name",
    firstNamePlaceholder: "Your first name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "Minimum 6 characters",
    signin: "Enter",
    signup: "Create my account",
    magic: "Send me a magic link",
    forgot: "Forgot password",
    site: "Enter the site",
    switchSignup: "I came to compose",
    switchSignin: "I already have an account",
    legal: "Your data stays attached to your account and protected by Supabase Auth.",
    magicSent: "Magic link sent. Check your inbox.",
    sessionReady: "Session opened. Redirecting...",
    authError: "Authentication failed.",
    loading: "...",
    checks: ["Saved journey", "Attached files", "Secure access"],
  },
} as const;

export function AuthClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session: existingSession } = useSupabaseSession();
  const t = copy[locale];
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dashboardPath = useMemo(() => `/${locale}/domus_animi`, [locale]);
  const redirectPath = searchParams.get("redirect") || dashboardPath;

  useEffect(() => {
    if (existingSession) router.replace(redirectPath);
  }, [existingSession, locale, redirectPath, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { prenom: prenom.trim() || email.split("@")[0] },
          },
        });

        if (signUpError) throw signUpError;

        setNotice(t.sessionReady);
        router.replace(redirectPath);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setNotice(t.sessionReady);
      router.replace(redirectPath);
    } catch (authError) {
      setError(translateAuthError(authError, locale));
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
        },
      });

      if (magicError) throw magicError;

      setNotice(t.magicSent);
    } catch (authError) {
      setError(translateAuthError(authError, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="premium-page min-h-[100svh] overflow-hidden px-5 pb-20 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[0.92fr_1.08fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-7 text-left"
        >
          <img src="/assets/totem-logo.png" alt="" className="h-14 w-14 object-contain" />
          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            {t.eyebrow}
          </p>
          <h1
            className="h-display text-4xl leading-tight md:text-6xl"
            style={{ color: "var(--ivoire)" }}
          >
            {mode === "signin" ? t.signinTitle : t.signupTitle}
          </h1>
          <p className="body-copy max-w-xl premium-muted">
            {mode === "signin" ? t.signinText : t.signupText}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {t.checks.map((item) => (
              <div key={item} className="premium-panel px-4 py-4">
                <ShieldCheck size={17} color="var(--or-ancestral)" />
                <p className="caption mt-2 premium-muted">{item}</p>
              </div>
            ))}
          </div>
          <Link href={`/${locale}`} className="btn-secondary w-fit">
            {t.site}
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="premium-panel-strong mx-auto flex w-full max-w-[520px] flex-col gap-6 p-5 md:p-8"
        >
          <div
            className="grid grid-cols-2 gap-2 rounded-sm border p-1"
            style={{ borderColor: "rgba(216,173,77,0.24)", background: "rgba(12,14,22,0.42)" }}
          >
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={tabClass(mode === "signin")}
            >
              {t.signin}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={tabClass(mode === "signup")}
            >
              {t.signup}
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <Field
                label={t.firstName}
                value={prenom}
                onChange={setPrenom}
                placeholder={t.firstNamePlaceholder}
                autoComplete="given-name"
                required
              />
            )}
            <Field
              label={t.email}
              value={email}
              onChange={setEmail}
              placeholder={t.emailPlaceholder}
              type="email"
              autoComplete="email"
              required
            />
            <Field
              label={t.password}
              value={password}
              onChange={setPassword}
              placeholder={t.passwordPlaceholder}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              required
            />

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
              {loading ? t.loading : mode === "signin" ? t.signin : t.signup}
            </button>
          </form>

          <button
            type="button"
            onClick={sendMagicLink}
            disabled={loading || !email.trim()}
            className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mail size={16} />
            {t.magic}
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href={`/${locale}/renovare_clavis`}
              className="caption uppercase"
              style={{ color: "var(--or-pale)" }}
            >
              {t.forgot}
            </Link>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="caption uppercase"
              style={{ color: "var(--or-ancestral)" }}
            >
              {mode === "signin" ? t.switchSignup : t.switchSignin}
            </button>
            <p className="caption max-w-sm premium-soft">{t.legal}</p>
          </div>
        </motion.div>
      </div>
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
      <span className="caption uppercase" style={{ color: "rgba(246,200,101,0.78)" }}>
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

function tabClass(active: boolean) {
  return `rounded-sm px-3 py-3 text-center text-[11px] font-semibold uppercase transition-colors ${
    active ? "bg-or text-indigo" : "text-or-pale hover:bg-ombre"
  }`;
}

function translateAuthError(error: unknown, locale: Locale) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();

  if (locale === "en") {
    if (lower.includes("invalid_credentials") || lower.includes("invalid login"))
      return "Incorrect email or password.";
    if (lower.includes("user_not_found")) return "Create an account first.";
    if (lower.includes("already registered") || lower.includes("already exists"))
      return "An account already exists with this email.";
    if (lower.includes("email not confirmed")) return "Please confirm your email address.";
    if (lower.includes("password")) return "Password must contain at least 6 characters.";
    if (lower.includes("email")) return "Check the email address.";
    if (lower.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";
    return message || copy.en.authError;
  }

  if (lower.includes("invalid_credentials") || lower.includes("invalid login"))
    return "Email ou mot de passe incorrect.";
  if (lower.includes("user_not_found")) return "Cree d'abord ton compte.";
  if (lower.includes("already registered") || lower.includes("already exists"))
    return "Un compte existe deja avec cet email.";
  if (lower.includes("email not confirmed")) return "Confirme d'abord ton adresse email.";
  if (lower.includes("password")) return "Mot de passe trop court, minimum 6 caracteres.";
  if (lower.includes("email")) return "Verifie l'adresse email.";
  if (lower.includes("rate limit"))
    return "Trop de tentatives. Attends un moment avant de reessayer.";
  return message || copy.fr.authError;
}
