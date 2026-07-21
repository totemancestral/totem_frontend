"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/auth-flow";

type Kind = "signup" | "signin";

const copy = {
  fr: {
    eyebrow: "Acces personnel",
    signinTitle: "Reviens dans ton espace",
    signupTitle: "Ouvre ton passage",
    signinText:
      "Retrouve ton parcours, tes commandes et tes oeuvres — ce que tu as commence t'attend intact.",
    signupText:
      "Cree ton compte pour commencer la composition. Ton parcours et tes livrables seront rattaches a cet espace.",
    signinChecks: ["Parcours sauvegarde", "Livrables rattaches", "Retour securise"],
    signupChecks: ["Nom ancestral unique", "Parchemin + audio + image", "Espace personnel a vie"],
    site: "Revenir a l'accueil",
    crossToSignup: "Nouveau ici ?",
    crossToSignupCta: "Compose ton oeuvre",
    crossToSignin: "Deja un compte ?",
    crossToSigninCta: "Reviens dans ton espace",
  },
  en: {
    eyebrow: "Personal access",
    signinTitle: "Return to your space",
    signupTitle: "Open your passage",
    signinText:
      "Find your journey, orders and artworks — what you began is waiting untouched.",
    signupText:
      "Create your account to start composing. Your journey and deliverables will be attached to this space.",
    signinChecks: ["Saved journey", "Attached files", "Secure return"],
    signupChecks: ["Unique ancestral name", "Parchment + audio + image", "Personal space for life"],
    site: "Back to home",
    crossToSignup: "New here?",
    crossToSignupCta: "Compose your work",
    crossToSignin: "Already have an account?",
    crossToSigninCta: "Return to your space",
  },
} as const;

export function AuthShell({
  locale,
  kind,
  otherPath,
  children,
}: {
  locale: Locale;
  kind: Kind;
  /** URL vers l'autre mode (préserve `redirect` query si présent). */
  otherPath: string;
  children: ReactNode;
}) {
  const t = copy[locale];
  const isSignup = kind === "signup";
  const title = isSignup ? t.signupTitle : t.signinTitle;
  const text = isSignup ? t.signupText : t.signinText;
  const checks = isSignup ? t.signupChecks : t.signinChecks;
  const crossLabel = isSignup ? t.crossToSignin : t.crossToSignup;
  const crossCta = isSignup ? t.crossToSigninCta : t.crossToSignupCta;

  return (
    <section
      className="premium-page relative min-h-[100svh] overflow-hidden px-5 pb-20 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/totem-logo.png" alt="" />
      </div>

      {/* Halo doré subtil derrière le hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(216,173,77,0.42), transparent 60%)" }}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[0.92fr_1.08fr] md:items-center">
        {/* ── Hero éditorial ─────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-7 text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/totem-logo.png" alt="" className="h-14 w-14 object-contain" />

          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            <span
              aria-hidden="true"
              className="mr-3 inline-block h-px w-8 align-middle"
              style={{ background: "var(--or-ancestral)", opacity: 0.7 }}
            />
            {t.eyebrow}
          </p>

          <h1
            className="h-display text-4xl leading-[1.05] md:text-6xl"
            style={{ color: "var(--ivoire)", textWrap: "balance" }}
          >
            {title}
          </h1>

          <p className="body-copy max-w-xl premium-muted">{text}</p>

          <ul className="grid gap-3 sm:grid-cols-3">
            {checks.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
                className="premium-panel px-4 py-4"
              >
                <ShieldCheck size={17} color="var(--or-ancestral)" />
                <p className="caption mt-2 premium-muted">{item}</p>
              </motion.li>
            ))}
          </ul>

          <Link href={`/${locale}`} className="btn-secondary mt-2 w-fit">
            {t.site}
            <ArrowRight size={16} />
          </Link>
        </motion.aside>

        {/* ── Panneau form ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="premium-panel-strong mx-auto flex w-full max-w-[520px] flex-col gap-6 p-5 md:p-8"
        >
          {children}

          <div
            className="flex items-center justify-between gap-4 border-t pt-5"
            style={{ borderColor: "rgba(216,173,77,0.18)" }}
          >
            <span className="caption uppercase premium-muted">{crossLabel}</span>
            <Link
              href={otherPath}
              className="caption inline-flex items-center gap-1 uppercase"
              style={{ color: "var(--or-ancestral)" }}
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
