"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { hasAdminRole } from "@/lib/admin-client";
import {
  ADMIN_PATH,
  dashboardPath,
  sendMagicLink,
  translateAuthError,
  type Locale,
} from "@/lib/auth-flow";
import { authPath, pagePath } from "@/lib/routes";
import { AuthShell, type AuthRole } from "./AuthShell";
import { AuthField } from "./AuthField";

function parseRole(raw: string | null): AuthRole {
  return raw === "junior" ? "junior" : "adulte";
}

const copy = {
  fr: {
    firstName: "Prenom",
    firstNamePlaceholder: "Ton prenom",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "Minimum 6 caracteres",
    submit: "Creer mon compte",
    submitLoading: "Creation...",
    or: "ou",
    magic: "Recevoir un lien magique",
    magicSending: "Envoi...",
    confirmSent: "Email de confirmation envoye. Verifie ta boite mail avant de continuer.",
    magicSent: "Lien magique envoye. Verifie ta boite mail.",
    sessionReady: "Session ouverte. Redirection...",
    consent: "En creant un compte, tu acceptes nos CGV et notre politique de confidentialite.",
  },
  en: {
    firstName: "First name",
    firstNamePlaceholder: "Your first name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "Minimum 6 characters",
    submit: "Create my account",
    submitLoading: "Creating...",
    or: "or",
    magic: "Send me a magic link",
    magicSending: "Sending...",
    confirmSent: "Confirmation email sent. Check your inbox before continuing.",
    magicSent: "Magic link sent. Check your inbox.",
    sessionReady: "Session opened. Redirecting...",
    consent: "By creating an account, you accept our terms and privacy policy.",
  },
} as const;

export function SignupClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session: existingSession } = useSupabaseSession();
  const t = copy[locale];

  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const role: AuthRole = parseRole(searchParams.get("role"));
  const defaultRedirect =
    role === "junior" ? `/${locale}/iuvenis_signum` : dashboardPath(locale);
  const redirectPath = searchParams.get("redirect") || defaultRedirect;
  const otherPath = useMemo(() => {
    const redirect = searchParams.get("redirect");
    const base = authPath(locale, "signin", redirect ?? undefined);
    if (role === "adulte") return base;
    return `${base}${base.includes("?") ? "&" : "?"}role=${role}`;
  }, [locale, role, searchParams]);

  useEffect(() => {
    if (!existingSession) return;
    const userId = existingSession.user.id;
    let alive = true;
    (async () => {
      const isAdmin = await hasAdminRole(userId);
      if (alive) router.replace(isAdmin ? ADMIN_PATH : redirectPath);
    })();
    return () => {
      alive = false;
    };
  }, [existingSession, redirectPath, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, prenom, locale, role, redirectPath }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "");
      }
      setNotice(t.confirmSent);
    } catch (authError) {
      setError(translateAuthError(authError, locale));
    } finally {
      setLoading(false);
    }
  };

  const onMagicLink = async () => {
    setMagicLoading(true);
    setError(null);
    setNotice(null);
    const result = await sendMagicLink({ email, locale, redirectPath });
    if (result.ok) setNotice(t.magicSent);
    else setError(result.error);
    setMagicLoading(false);
  };

  // Sécurité UX : si Supabase a émis la session (auto-confirm), on redirige.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) setNotice(t.sessionReady);
    });
    return () => data.subscription.unsubscribe();
  }, [t.sessionReady]);

  return (
    <AuthShell locale={locale} kind="signup" role={role} otherPath={otherPath}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <AuthField
          label={t.firstName}
          value={prenom}
          onChange={setPrenom}
          placeholder={t.firstNamePlaceholder}
          autoComplete="given-name"
          required
        />
        <AuthField
          label={t.email}
          value={email}
          onChange={setEmail}
          placeholder={t.emailPlaceholder}
          type="email"
          autoComplete="email"
          required
        />
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

        {error && (
          <p className="text-center text-sm" style={{ color: "#E07A6B" }} role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="text-center text-sm" style={{ color: "var(--or-pale)" }} role="status">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? t.submitLoading : t.submit}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "rgba(216,173,77,0.22)" }}
        />
        <span className="caption uppercase premium-muted">{t.or}</span>
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "rgba(216,173,77,0.22)" }}
        />
      </div>

      <button
        type="button"
        onClick={onMagicLink}
        disabled={magicLoading || !email.trim()}
        className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Mail size={16} />
        {magicLoading ? t.magicSending : t.magic}
      </button>

      <p className="caption text-center premium-muted" style={{ lineHeight: 1.5 }}>
        {t.consent}{" "}
        <Link href={pagePath(locale, "cgv")} className="underline" style={{ color: "var(--or-pale)" }}>
          {locale === "fr" ? "CGV" : "Terms"}
        </Link>
      </p>
    </AuthShell>
  );
}
