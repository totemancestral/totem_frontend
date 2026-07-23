"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/auth-flow";

type Kind = "signup" | "signin";
export type AuthRole = "adulte" | "junior";

/** Copy dépendant du rôle & mode. */
const copy = {
  fr: {
    site: "Revenir a l'accueil",
    crossToSignup: "Nouveau ici ?",
    crossToSignupCta: "Compose ton oeuvre",
    crossToSignin: "Deja un compte ?",
    crossToSigninCta: "Reviens dans ton espace",
    adulte: {
      eyebrow: "Acces personnel",
      signup: {
        title: "Ouvre ton passage",
        text: "Cree ton compte pour commencer la composition. Ton parcours et tes livrables seront rattaches a cet espace.",
        checks: ["Nom ancestral unique", "Parchemin + audio + image", "Espace personnel a vie"],
      },
      signin: {
        title: "Reviens dans ton espace",
        text: "Retrouve ton parcours, tes commandes et tes oeuvres — ce que tu as commence t'attend intact.",
        checks: ["Parcours sauvegarde", "Livrables rattaches", "Retour securise"],
      },
    },
    junior: {
      eyebrow: "Espace Junior",
      signup: {
        title: "Reveille ton totem",
        text: "Cree ton compte pour decouvrir ton totem, ton nom ancestral et defier tes amis.",
        checks: ["Ton totem parmi 12", "Ton nom ancestral", "Defie tes amis"],
      },
      signin: {
        title: "Rejoins ton clan",
        text: "Reviens voir ton totem, ton nom ancestral et partager le defi avec tes amis.",
        checks: ["Ton totem", "Ton clan", "Ton defi"],
      },
    },
  },
  en: {
    site: "Back to home",
    crossToSignup: "New here?",
    crossToSignupCta: "Compose your work",
    crossToSignin: "Already have an account?",
    crossToSigninCta: "Return to your space",
    adulte: {
      eyebrow: "Personal access",
      signup: {
        title: "Open your passage",
        text: "Create your account to start composing. Your journey and deliverables will be attached to this space.",
        checks: ["Unique ancestral name", "Parchment + audio + image", "Personal space for life"],
      },
      signin: {
        title: "Return to your space",
        text: "Find your journey, orders and artworks — what you began is waiting untouched.",
        checks: ["Saved journey", "Attached files", "Secure return"],
      },
    },
    junior: {
      eyebrow: "Junior space",
      signup: {
        title: "Awaken your totem",
        text: "Create your account to discover your totem, your ancestral name and challenge your friends.",
        checks: ["Your totem among 12", "Your ancestral name", "Challenge your friends"],
      },
      signin: {
        title: "Join your clan",
        text: "Come back to see your totem, your ancestral name and share the challenge.",
        checks: ["Your totem", "Your clan", "Your challenge"],
      },
    },
  },
} as const;

/** Habillage visuel dépendant du rôle. */
const skin = {
  adulte: {
    haloA: "rgba(216,173,77,0.42)", // or ancestral
    haloB: "rgba(216,173,77,0.20)",
    icon: ShieldCheck,
    accent: "var(--or-ancestral)",
  },
  junior: {
    haloA: "rgba(240,140,60,0.42)", // feu (Kwame/Dayo)
    haloB: "rgba(216,173,77,0.32)",
    icon: Sparkles,
    accent: "var(--or-pale)",
  },
} as const;

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
  const roleCopy = t[role];
  const modeCopy = roleCopy[kind];
  const s = skin[role];
  const CheckIcon = s.icon;
  const isSignup = kind === "signup";
  const crossLabel = isSignup ? t.crossToSignin : t.crossToSignup;
  const crossCta = isSignup ? t.crossToSigninCta : t.crossToSignupCta;

  return (
    <section
      className="premium-page relative flex w-full items-center overflow-hidden px-5 pb-12 pt-24 md:px-10 md:py-16"
      style={{ background: "var(--nuit-profonde)", minHeight: "100svh" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/totem-logo.png" alt="" />
      </div>

      {/* Halo décoratif dépendant du rôle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full opacity-40 blur-[140px]"
        style={{ background: `radial-gradient(circle, ${s.haloA}, transparent 60%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-160px] bottom-[-120px] h-[360px] w-[360px] rounded-full opacity-30 blur-[130px]"
        style={{ background: `radial-gradient(circle, ${s.haloB}, transparent 60%)` }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1fr_minmax(0,420px)] md:items-center md:gap-14">
        {/* ── Hero éditorial ─────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6 text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/totem-logo.png" alt="" className="h-12 w-12 object-contain md:h-14 md:w-14" />

          <p className="eyebrow" style={{ color: s.accent }}>
            <span
              aria-hidden="true"
              className="mr-3 inline-block h-px w-8 align-middle"
              style={{ background: s.accent, opacity: 0.7 }}
            />
            {roleCopy.eyebrow}
          </p>

          <h1
            className="h-display text-3xl leading-[1.05] md:text-5xl lg:text-6xl"
            style={{ color: "var(--ivoire)", textWrap: "balance" }}
          >
            {modeCopy.title}
          </h1>

          <p className="body-copy max-w-xl premium-muted">{modeCopy.text}</p>

          <ul className="grid gap-3 sm:grid-cols-3">
            {modeCopy.checks.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
                className="premium-panel px-4 py-4"
              >
                <CheckIcon size={17} color={s.accent} />
                <p className="caption mt-2 premium-muted">{item}</p>
              </motion.li>
            ))}
          </ul>

          <Link href={`/${locale}`} className="btn-secondary mt-1 w-fit">
            {t.site}
            <ArrowRight size={16} />
          </Link>
        </motion.aside>

        {/* ── Panneau form ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="premium-panel-strong mx-auto flex w-full max-w-[420px] flex-col gap-5 p-5 md:p-7"
        >
          {children}

          <div
            className="flex items-center justify-between gap-4 border-t pt-4"
            style={{ borderColor: "rgba(216,173,77,0.18)" }}
          >
            <span className="caption uppercase premium-muted">{crossLabel}</span>
            <Link
              href={otherPath}
              className="caption inline-flex items-center gap-1 uppercase"
              style={{ color: s.accent }}
            >
              {crossCta}
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
