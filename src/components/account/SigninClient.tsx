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
    email: "Email",
    emailPlaceholder: "ton@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "Ton mot de passe",
    submit: "Entrer",
    submitLoading: "Connexion...",
    or: "ou",
    magic: "Recevoir un lien magique",
    magicSending: "Envoi…",
    magicSent: "Lien magique envoyé. Vérifie ta boîte mail.",
    sessionReady: "Session ouverte. Redirection…",
    forgot: "Mot de passe oublie ?",
  },
  en: {
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    submit: "Enter",
    submitLoading: "Signing in...",
    or: "or",
    magic: "Send me a magic link",
    magicSending: "Sending...",
    magicSent: "Magic link sent. Check your inbox.",
    sessionReady: "Session opened. Redirecting...",
    forgot: "Forgot password?",
  },
} as const;

export function SigninClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session: existingSession } = useSupabaseSession();
  const t = copy[locale];

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
    const base = authPath(locale, "signup", redirect ?? undefined);
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      setNotice(t.sessionReady);
      const isAdmin = await hasAdminRole(signInData.user?.id);
      router.replace(isAdmin ? ADMIN_PATH : redirectPath);
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

  return (
    <AuthShell locale={locale} kind="signin" role={role} otherPath={otherPath}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
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

      <div className="text-center">
        <Link
          href={pagePath(locale, "reset_password")}
          className="caption uppercase"
          style={{ color: "var(--or-pale)" }}
        >
          {t.forgot}
        </Link>
      </div>
    </AuthShell>
  );
}
