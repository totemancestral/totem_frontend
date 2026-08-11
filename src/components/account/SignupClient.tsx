"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";
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
    firstName: "Prénom",
    firstNamePlaceholder: "Ton prénom",
    lastName: "Nom",
    lastNamePlaceholder: "Ton nom",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "Minimum 6 caractères",
    submit: "Créer mon compte",
    submitLoading: "Création…",
    or: "ou",
    magic: "Recevoir un lien magique",
    magicSending: "Envoi…",
    confirmSent: "Email de confirmation envoyé. Vérifie ta boîte mail avant de continuer.",
    magicSent: "Lien magique envoyé. Vérifie ta boîte mail.",
    sessionReady: "Session ouverte. Redirection…",
    consent: "En créant un compte, tu acceptes nos CGV et notre politique de confidentialité.",
    roleLegend: "Je crée un compte",
    roleAdulte: "Adulte",
    roleJunior: "Junior",
    roleAdulteHint: "Parcours complet · parchemin, audio & image",
    roleJuniorHint: "Totem express · 12 signes, défie tes amis",
  },
  en: {
    firstName: "First name",
    firstNamePlaceholder: "Your first name",
    lastName: "Last name",
    lastNamePlaceholder: "Your last name",
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
    roleLegend: "I'm creating an account as",
    roleAdulte: "Adult",
    roleJunior: "Junior",
    roleAdulteHint: "Full journey · parchment, audio & image",
    roleJuniorHint: "Express totem · 12 signs, challenge friends",
  },
} as const;

export function SignupClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session: existingSession } = useSupabaseSession();
  const t = copy[locale];

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<AuthRole>(() => parseRole(searchParams.get("role")));
  const defaultRedirect = role === "junior" ? `/${locale}/iuvenis_signum` : dashboardPath(locale);
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
        body: JSON.stringify({ email, password, prenom, nom, locale, role, redirectPath }),
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
      <fieldset className="flex flex-col gap-2">
        <legend className="caption mb-1 uppercase premium-muted">{t.roleLegend}</legend>
        <div
          className="grid grid-cols-2 gap-2 rounded-2xl p-1"
          style={{ background: "rgba(13,13,26,0.55)", border: "1px solid rgba(216,173,77,0.18)" }}
        >
          <RoleOption
            active={role === "adulte"}
            onClick={() => setRole("adulte")}
            icon={<ShieldCheck size={16} />}
            label={t.roleAdulte}
            hint={t.roleAdulteHint}
          />
          <RoleOption
            active={role === "junior"}
            onClick={() => setRole("junior")}
            icon={<Sparkles size={16} />}
            label={t.roleJunior}
            hint={t.roleJuniorHint}
          />
        </div>
      </fieldset>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {/* Nom et prenom cote a cote, comme sur la maquette : les deux sont
            requis pour pouvoir rattacher une oeuvre a une personne. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={t.firstName}
            value={prenom}
            onChange={setPrenom}
            placeholder={t.firstNamePlaceholder}
            autoComplete="given-name"
            required
          />
          <AuthField
            label={t.lastName}
            value={nom}
            onChange={setNom}
            placeholder={t.lastNamePlaceholder}
            autoComplete="family-name"
            required
          />
        </div>
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
        <Link
          href={pagePath(locale, "cgv")}
          className="underline"
          style={{ color: "var(--or-pale)" }}
        >
          {locale === "fr" ? "CGV" : "Terms"}
        </Link>
      </p>
    </AuthShell>
  );
}

function RoleOption({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all"
      style={{
        background: active ? "rgba(216,173,77,0.14)" : "transparent",
        boxShadow: active ? "0 0 0 1px var(--or-ancestral)" : "0 0 0 1px transparent",
      }}
    >
      <span
        className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide"
        style={{ color: active ? "var(--or-pale)" : "rgba(226,225,238,0.66)" }}
      >
        {icon}
        {label}
      </span>
      <span
        className="text-[11px] leading-snug"
        style={{ color: active ? "rgba(245,240,232,0.62)" : "rgba(226,225,238,0.4)" }}
      >
        {hint}
      </span>
    </button>
  );
}
