"use client";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import { PasswordField } from "@/components/ui/PasswordField";
import { supabase } from "@/lib/supabase/client";
import { isStrongPassword } from "@/lib/password";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// aligné sur l'ordre de dict.inscription.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#D8D0BC",
  "--color-or": "#B08A3E",
  "--color-orpale": "#8B6F2E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#948C78",
} as CSSProperties;

export default function Inscription({ dict, lang }: { dict: Dictionary["inscription"]; lang: Locale }) {
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
  const [checkingAuth, setCheckingAuth] = useState(true);

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

    if (!isStrongPassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.");
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
        sessionReady?: boolean;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Inscription impossible");
        return;
      }

      if (payload?.sessionReady) {
        // Confirmation email désactivée côté projet Supabase : la session est
        // déjà active, on peut enchaîner directement sur le parcours.
        router.push(nextPath);
      } else {
        router.push(
          `/${lang}/verification?next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(email)}`,
        );
      }
    } catch {
      setError("Inscription impossible. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return <div className="min-h-screen bg-nuit" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
        className="flex min-h-0 flex-1 overflow-y-auto px-6 py-20 lg:px-20"
        style={ivoireScope}
      >
        <form onSubmit={onSubmit} className="m-auto flex w-full max-w-lg flex-col gap-7">

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
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gris">
              {dict.pathLabel}
            </span>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPath("adulte")}
                aria-pressed={path === "adulte"}
                className={`flex flex-1 flex-col gap-1.5 border p-5 text-left ${
                  path === "adulte" ? "border-[1.5px] border-or bg-indigo" : "border-ombre"
                }`}
              >
                <span className="font-display text-xl text-ivoire">{dict.pathAdulte}</span>
                <span className="text-sm text-grisclair">{dict.pathAdulteDesc}</span>
              </button>
              <button
                type="button"
                onClick={() => setPath("junior")}
                aria-pressed={path === "junior"}
                className={`flex flex-1 flex-col gap-1.5 border p-5 text-left ${
                  path === "junior" ? "border-[1.5px] border-or bg-indigo" : "border-ombre"
                }`}
              >
                <span className="font-display text-xl text-ivoire">{dict.pathJunior}</span>
                <span className="text-sm text-grisclair">{dict.pathJuniorDesc}</span>
              </button>
            </div>
          </div>

          {/* formulaire */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">
                  {dict.firstNameLabel}
                </span>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={dict.firstNamePlaceholder}
                  required
                  maxLength={80}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gris">
                  {dict.lastNameLabel}
                </span>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={dict.lastNamePlaceholder}
                  required
                  maxLength={80}
                  className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">
                {dict.genderLabel}
              </span>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setGender("homme")}
                  aria-pressed={gender === "homme"}
                  className={`flex-1 border p-3.5 text-center text-sm ${
                    gender === "homme" ? "border-[1.5px] border-or text-ivoire" : "border-ombre text-grisclair"
                  }`}
                >
                  {dict.genderMale}
                </button>
                <button
                  type="button"
                  onClick={() => setGender("femme")}
                  aria-pressed={gender === "femme"}
                  className={`flex-1 border p-3.5 text-center text-sm ${
                    gender === "femme" ? "border-[1.5px] border-or text-ivoire" : "border-ombre text-grisclair"
                  }`}
                >
                  {dict.genderFemale}
                </button>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.emailPlaceholder}
                autoComplete="email"
                required
                maxLength={255}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire placeholder:text-grisclair"
              />
            </label>

            <PasswordField
              label={dict.passwordLabel}
              name="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              showRequirements
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#B0473E" }} role="alert">
              {error}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={loading} className="disabled:cursor-wait disabled:opacity-60">
              {loading ? "…" : dict.submit}
            </Button>
          </div>

          <p className="text-sm text-grisclair">
            {dict.signupLine}{" "}
            <Link href={`/${lang}/connexion`} className="text-or">
              {dict.signupLink}
            </Link>
          </p>

          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex gap-6">
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
