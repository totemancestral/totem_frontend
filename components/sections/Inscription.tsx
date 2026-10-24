"use client";
import { interfaceCopy } from "@/lib/interface-copy";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import { PasswordField } from "@/components/ui/PasswordField";
import { RadioCard } from "@/components/ui/RadioCard";
import { supabase } from "@/lib/supabase/client";
import { isStrongPassword } from "@/lib/password";
import { retryNotice } from "@/lib/retry-after";
import { establishSignupSession } from "@/lib/signup-session";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// aligné sur l'ordre de dict.inscription.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#857A63",
  "--color-or": "#806020",
  "--color-orpale": "#7B612E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#706655",
} as CSSProperties;

export default function Inscription({ dict, lang }: { dict: Dictionary["inscription"]; lang: Locale }) {
  const ui = interfaceCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  // null = pas d'offre choisie avant l'inscription (ex: venu de "Composer"
  // dans la nav) : le parcours demandera le choix après les questions.
  const offre = searchParams.get("offre");

  const [path, setPath] = useState<"adulte" | "junior">("adulte");
  const [gender, setGender] = useState<"homme" | "femme">("homme");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorField, setErrorField] = useState<"email" | "password" | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!error) return;
    const field = errorField && formRef.current?.elements.namedItem(errorField);
    if (field instanceof HTMLElement) field.focus();
    else errorRef.current?.focus();
  }, [error, errorField]);

  // Quelqu'un déjà connecté qui arrive ici (ex: bouton "Composer" cliqué
  // avec une session active) a déjà un compte : on le renvoie vers son
  // espace plutôt que de lui montrer un nouveau formulaire d'inscription.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (data.session) {
        router.replace(`/${lang}/espace`);
        return;
      }
      setCheckingAuth(false);
    });
    return () => {
      alive = false;
    };
  }, [lang, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorField(null);
    setExistingAccount(false);

    if (!isStrongPassword(password)) {
      setErrorField("password");
      setError(ui.errors.passwordRules);
      return;
    }

    setLoading(true);

    const nextPath =
      path === "junior"
        ? `/${lang}/parcours-junior`
        : `/${lang}/parcours${offre ? `?offre=${offre}` : ""}`;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          prenom: firstName,
          nom: lastName,
          sexe: gender,
          locale: lang,
          redirectPath: nextPath,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        code?: string;
        sessionReady?: boolean;
        accessToken?: string | null;
        refreshToken?: string | null;
      } | null;

      if (!response.ok) {
        const alreadyExists = payload?.code === "email_exists";
        setExistingAccount(alreadyExists);
        setErrorField(alreadyExists ? "email" : null);
        setError(retryNotice(response, lang) ?? (alreadyExists ? dict.emailExists : ui.errors.signupFailed));
        return;
      }

      if (payload?.sessionReady) {
        // Persist the returned session before opening an authenticated route.
        if (!await establishSignupSession(payload, supabase.auth)) {
          setError(ui.errors.signupFailed);
          return;
        }
        router.push(nextPath);
      } else {
        router.push(
          `/${lang}/verification?next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(email)}`,
        );
      }
    } catch {
      setError(ui.errors.signupFailed);
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-nuit px-6 text-ivoire"><p role="status">{ui.status.checkingSession}</p></div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* panneau photo : réservé au bureau */}
      <div className="relative hidden h-screen w-[42%] shrink-0 overflow-hidden bg-nuit lg:block [perspective:1200px]">
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
        className="flex min-w-0 flex-1 px-6 py-20 lg:px-20"
        style={ivoireScope}
      >
        <p role="status" className="sr-only">{loading ? (ui.status.creatingAccount) : ""}</p>
        <form method="post" ref={formRef} onSubmit={onSubmit} aria-busy={loading} className="m-auto flex w-full min-w-0 max-w-lg flex-col gap-7 [overflow-wrap:anywhere]">

          <div className="flex flex-col gap-7">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <div>
              <h1 className="font-display text-5xl text-ivoire">{dict.title}</h1>
              <p className="mt-3.5 text-xs font-medium uppercase tracking-wide text-gris">
                {dict.subtitle}
              </p>
            </div>
            <p className="font-display text-xl italic leading-snug text-orpale">
              {dict.quoteLine1}
              <br />
              {dict.quoteLine2}
            </p>
          </div>

          {/* parcours */}
          <fieldset className="flex min-w-0 flex-col gap-3">
            <legend className="mb-3 text-xs font-medium uppercase tracking-wide text-gris">
              {dict.pathLabel}
            </legend>
            <div className="flex gap-4">
              <RadioCard
                name="path" value="adulte"
                onChange={() => setPath("adulte")}
                checked={path === "adulte"}
                className={`flex flex-1 flex-col gap-1.5 border p-5 text-left ${
                  path === "adulte" ? "border-[1.5px] border-or bg-indigo" : "border-ombre"
                }`}
              >
                <span className="font-display text-xl text-ivoire">{dict.pathAdulte}</span>
                <span className="text-sm text-grisclair">{dict.pathAdulteDesc}</span>
              </RadioCard>
              <RadioCard
                name="path" value="junior"
                onChange={() => setPath("junior")}
                checked={path === "junior"}
                className={`flex flex-1 flex-col gap-1.5 border p-5 text-left ${
                  path === "junior" ? "border-[1.5px] border-or bg-indigo" : "border-ombre"
                }`}
              >
                <span className="font-display text-xl text-ivoire">{dict.pathJunior}</span>
                <span className="text-sm text-grisclair">{dict.pathJuniorDesc}</span>
              </RadioCard>
            </div>
          </fieldset>

          {/* formulaire */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">
                  {dict.firstNameLabel}
                </span>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={dict.firstNamePlaceholder}
                  required
                  maxLength={80}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">
                  {dict.lastNameLabel}
                </span>
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={dict.lastNamePlaceholder}
                  required
                  maxLength={80}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
            </div>

            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-gris">
                {dict.genderLabel}
              </legend>
              <div className="flex gap-4">
                <RadioCard
                  name="gender" value="homme"
                  onChange={() => setGender("homme")}
                  checked={gender === "homme"}
                  className={`flex-1 border p-3.5 text-center text-sm ${
                    gender === "homme" ? "border-[1.5px] border-or text-ivoire" : "border-ombre text-grisclair"
                  }`}
                >
                  {dict.genderMale}
                </RadioCard>
                <RadioCard
                  name="gender" value="femme"
                  onChange={() => setGender("femme")}
                  checked={gender === "femme"}
                  className={`flex-1 border p-3.5 text-center text-sm ${
                    gender === "femme" ? "border-[1.5px] border-or text-ivoire" : "border-ombre text-grisclair"
                  }`}
                >
                  {dict.genderFemale}
                </RadioCard>
              </div>
            </fieldset>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
              <input
                type="email"
                name="email"
                aria-invalid={errorField === "email" && !!error || undefined}
                aria-describedby={errorField === "email" && error ? "signup-error" : undefined}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errorField === "email") { setError(null); setErrorField(null); setExistingAccount(false); } }}
                placeholder={dict.emailPlaceholder}
                autoComplete="email"
                required
                maxLength={255}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>

            <PasswordField
              lang={lang}
              label={dict.passwordLabel}
              name="password"
              value={password}
              onChange={(value) => { setPassword(value); if (errorField === "password") { setError(null); setErrorField(null); } }}
              invalid={errorField === "password" && !!error}
              describedBy={errorField === "password" && error ? "signup-error" : undefined}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              showRequirements
            />
          </div>

          {error && (
            <p id="signup-error" ref={errorRef} tabIndex={-1} className="text-sm focus:outline-2 focus:outline-offset-4 focus:outline-or" style={{ color: "#B0473E" }} role="alert">
              {error}
            </p>
          )}
          {existingAccount && (
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href={`/${lang}/connexion`} className="text-or underline underline-offset-4">{dict.existingSignIn}</Link>
              <Link href={`/${lang}/mot-de-passe-oublie`} className="text-or underline underline-offset-4">{dict.existingResetPassword}</Link>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={loading} className="hover:text-[#FEFCF0]! disabled:cursor-wait disabled:opacity-60">
              {loading ? (ui.status.creatingAccount) : dict.submit}
            </Button>
          </div>

          <p className="text-sm text-grisclair">
            {dict.signupLine}{" "}
            <Link href={`/${lang}/connexion`} className="text-or">
              {dict.signupLink}
            </Link>
          </p>

          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
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
