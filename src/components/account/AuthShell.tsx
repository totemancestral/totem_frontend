"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/auth-flow";

type Kind = "signup" | "signin";
export type AuthRole = "adulte" | "junior";

/**
 * Copy des deux volets.
 *
 * Le volet visuel ne porte qu'une accroche : c'est lui qui donne le ton. Le
 * volet formulaire annonce sobrement ce qu'on y fait.
 */
const copy = {
  fr: {
    back: "Revenir à l'accueil",
    crossToSignup: "Pas encore de compte ?",
    crossToSignupCta: "Créer un compte",
    crossToSignin: "Déjà un compte ?",
    crossToSigninCta: "Se connecter",
    adulte: {
      signup: {
        headline: "Ouvre ton passage",
        formTitle: "Créer un compte",
        formSubtitle: "Ton parcours et tes œuvres seront rattachés à cet espace.",
      },
      signin: {
        headline: "Te revoilà",
        formTitle: "Connexion",
        formSubtitle: "Entre tes identifiants pour retrouver ton espace.",
      },
    },
    junior: {
      signup: {
        headline: "Réveille ton totem",
        formTitle: "Créer un compte",
        formSubtitle: "Découvre ton totem, ton nom ancestral, et défie tes amis.",
      },
      signin: {
        headline: "Rejoins ton clan",
        formTitle: "Connexion",
        formSubtitle: "Retrouve ton totem et ton nom ancestral.",
      },
    },
  },
  en: {
    back: "Back to home",
    crossToSignup: "No account yet?",
    crossToSignupCta: "Create an account",
    crossToSignin: "Already have an account?",
    crossToSigninCta: "Log in",
    adulte: {
      signup: {
        headline: "Open your passage",
        formTitle: "Create Account",
        formSubtitle: "Your journey and your works will be attached to this space.",
      },
      signin: {
        headline: "Welcome back",
        formTitle: "Login",
        formSubtitle: "Enter your details to return to your space.",
      },
    },
    junior: {
      signup: {
        headline: "Awaken your totem",
        formTitle: "Create Account",
        formSubtitle: "Discover your totem, your ancestral name, and challenge your friends.",
      },
      signin: {
        headline: "Join your clan",
        formTitle: "Login",
        formSubtitle: "Find your totem and your ancestral name again.",
      },
    },
  },
} as const;

const VISUAL = "/assets/oeuvre-visuelle-voix.jpg";

export function AuthShell({
  locale,
  kind,
  role = "adulte",
  otherPath,
  children,
}: {
  locale: Locale;
  kind: Kind;
  role?: AuthRole;
  /** URL vers l'autre mode (préserve `redirect` et `role` si présents). */
  otherPath: string;
  children: ReactNode;
}) {
  const t = copy[locale];
  const modeCopy = t[role][kind];
  const isSignup = kind === "signup";
  const crossLabel = isSignup ? t.crossToSignin : t.crossToSignup;
  const crossCta = isSignup ? t.crossToSigninCta : t.crossToSignupCta;

  // Création : le visuel accueille à gauche. Connexion : il referme à droite.
  const visualSide = isSignup ? "md:order-1" : "md:order-2";
  const formSide = isSignup ? "md:order-2" : "md:order-1";

  return (
    <section
      className="premium-page relative flex w-full items-center justify-center overflow-hidden px-4 py-20 md:px-8 md:py-16"
      style={{ background: "var(--nuit-profonde)", minHeight: "100svh" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full opacity-30 blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(216,173,77,0.4), transparent 62%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border md:grid-cols-2"
        style={{
          borderColor: "rgba(216,173,77,0.22)",
          background: "rgba(17,17,26,0.92)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
        }}
      >
        {/* ── Volet visuel ───────────────────────────────────────────── */}
        <div
          className={`relative flex min-h-[220px] flex-col justify-between overflow-hidden p-7 md:min-h-[640px] md:p-9 ${visualSide}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={VISUAL}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(165deg, rgba(13,13,26,0.62) 0%, rgba(13,13,26,0.30) 42%, rgba(13,13,26,0.88) 100%)",
            }}
          />

          <Link
            href={`/${locale}`}
            className="caption relative inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 uppercase backdrop-blur transition-colors hover:bg-ombre"
            style={{
              borderColor: "rgba(216,173,77,0.3)",
              background: "rgba(13,13,26,0.45)",
              color: "var(--or-pale)",
            }}
          >
            <ArrowLeft size={14} />
            {t.back}
          </Link>

          <h1
            className="h-display relative mt-8 text-4xl leading-[1.05] md:text-5xl"
            style={{ color: "var(--ivoire)", textWrap: "balance" }}
          >
            {modeCopy.headline}
          </h1>
        </div>

        {/* ── Volet formulaire ───────────────────────────────────────── */}
        <div className={`flex flex-col justify-center gap-5 p-7 md:p-10 ${formSide}`}>
          <header className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/totem-logo.png"
              alt=""
              className="mb-2 h-10 w-10 object-contain"
            />
            <h2 className="h-display text-3xl" style={{ color: "var(--or-pale)" }}>
              {modeCopy.formTitle}
            </h2>
            <p className="caption premium-muted" style={{ lineHeight: 1.5 }}>
              {modeCopy.formSubtitle}
            </p>
          </header>

          {children}

          <Link
            href={otherPath}
            className="flex flex-wrap items-center justify-center gap-2 border-t pt-4 transition-opacity hover:opacity-80"
            style={{ borderColor: "rgba(216,173,77,0.18)", textDecoration: "none" }}
            aria-label={`${crossLabel} ${crossCta}`}
          >
            <span className="caption premium-muted">{crossLabel}</span>
            <span
              className="caption inline-flex items-center gap-1"
              style={{ color: "var(--or-ancestral)" }}
            >
              {crossCta}
              <ArrowUpRight size={13} />
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
