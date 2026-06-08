"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    signupSent: "Compte cree. Si la confirmation email est activee, verifie ta boite mail.",
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
    signupSent: "Account created. If email confirmation is enabled, check your inbox.",
    sessionReady: "Session opened. Redirecting...",
    authError: "Authentication failed.",
    loading: "...",
    checks: ["Saved journey", "Attached files", "Secure access"],
  },
} as const;

export function AuthClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = copy[locale];
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dashboardPath = useMemo(() => `/${locale}/espace-personnel`, [locale]);
  const redirectPath = searchParams.get("redirect") || dashboardPath;

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) {
        ensureProfile(data.session.user, locale).finally(() => {
          if (alive) router.replace(redirectPath);
        });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        ensureProfile(session.user, locale).finally(() => {
          if (alive) router.replace(redirectPath);
        });
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [locale, redirectPath, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectPath}`,
            data: { prenom, langue: locale },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          await ensureProfile(data.session.user, locale, email, prenom);
          setNotice(t.sessionReady);
          router.replace(redirectPath);
          return;
        }
        setNotice(t.signupSent);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      if (data.user) await ensureProfile(data.user, locale, email);
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
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
          shouldCreateUser: mode === "signup",
        },
      });
      if (otpError) throw otpError;
      setNotice(t.magicSent);
    } catch (authError) {
      setError(translateAuthError(authError, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-[100svh] px-5 pb-20 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6 text-left"
        >
          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            {t.eyebrow}
          </p>
          <h1
            className="h-display text-4xl leading-tight md:text-6xl"
            style={{ color: "var(--ivoire)" }}
          >
            {mode === "signin" ? t.signinTitle : t.signupTitle}
          </h1>
          <p className="body-copy max-w-xl" style={{ color: "rgba(254,252,240,0.76)" }}>
            {mode === "signin" ? t.signinText : t.signupText}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {t.checks.map((item) => (
              <div
                key={item}
                className="rounded-md border px-4 py-3"
                style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.24)" }}
              >
                <ShieldCheck size={17} color="var(--or-ancestral)" />
                <p className="caption mt-2" style={{ color: "rgba(254,252,240,0.72)" }}>
                  {item}
                </p>
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
          className="card-totem mx-auto flex w-full max-w-[520px] flex-col gap-6 !p-5 md:!p-8"
        >
          <div
            className="grid grid-cols-2 gap-2 rounded-md border p-1"
            style={{ borderColor: "rgba(201,168,76,0.22)" }}
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
              href={`/${locale}/reset-password`}
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
            <p className="caption max-w-sm" style={{ color: "rgba(254,252,240,0.52)" }}>
              {t.legal}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

async function ensureProfile(user: User, locale: Locale, fallbackEmail = "", fallbackPrenom = "") {
  const metadata = user.user_metadata as { prenom?: string; langue?: Locale };
  const prenom = fallbackPrenom.trim() || metadata.prenom?.trim();
  const email = user.email || fallbackEmail.trim();

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: email || null,
      langue: metadata.langue || locale,
      ...(prenom ? { prenom } : {}),
    },
    { onConflict: "id" },
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

function tabClass(active: boolean) {
  return `rounded px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
    active ? "bg-or text-indigo" : "text-or-pale hover:bg-ombre"
  }`;
}

function translateAuthError(error: unknown, locale: Locale) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();
  if (locale === "en") {
    if (lower.includes("invalid login")) return "Incorrect email or password.";
    if (lower.includes("already registered") || lower.includes("already exists"))
      return "An account already exists with this email.";
    if (lower.includes("password")) return "Password must contain at least 6 characters.";
    if (lower.includes("email")) return "Check the email address.";
    return message || copy.en.authError;
  }
  if (lower.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (lower.includes("already registered") || lower.includes("already exists"))
    return "Un compte existe deja avec cet email.";
  if (lower.includes("password")) return "Mot de passe trop court, minimum 6 caracteres.";
  if (lower.includes("email")) return "Verifie l'adresse email.";
  return message || copy.fr.authError;
}
