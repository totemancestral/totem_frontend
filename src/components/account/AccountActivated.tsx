"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type Locale = "fr" | "en";

const copy = {
  fr: {
    eyebrow: "Compte active",
    title: "Ton compte est activé",
    text: "Bienvenue. Ton espace personnel t'attend — on t'y emmène.",
    cta: "Accéder à mon espace",
    redirecting: "Redirection dans",
  },
  en: {
    eyebrow: "Account activated",
    title: "Your account is active",
    text: "Welcome. Your personal space is ready — taking you there.",
    cta: "Go to my space",
    redirecting: "Redirecting in",
  },
} as const;

/** N'accepte qu'un chemin interne (évite les redirections ouvertes). */
function safeNext(raw: string | null, locale: Locale): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return `/${locale}/domus_animi`;
}

export function AccountActivated({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), locale);
  const [count, setCount] = useState(4);

  useEffect(() => {
    const tick = setInterval(() => setCount((current) => Math.max(0, current - 1)), 1000);
    const to = setTimeout(() => router.replace(next), 4000);
    return () => {
      clearInterval(tick);
      clearTimeout(to);
    };
  }, [next, router]);

  return (
    <section
      className="premium-page relative flex w-full items-center justify-center overflow-hidden px-5 py-8 md:h-[100svh] md:py-10"
      style={{ background: "var(--nuit-profonde)", minHeight: "100svh" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(216,173,77,0.5), transparent 60%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="premium-panel-strong relative mx-auto flex w-full max-w-[460px] flex-col items-center gap-6 p-8 text-center"
      >
        <div className="premium-icon-box">
          <CheckCircle2 size={22} />
        </div>
        <div>
          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            {t.eyebrow}
          </p>
          <h1 className="h-display mt-2 text-4xl" style={{ color: "var(--ivoire)" }}>
            {t.title}
          </h1>
          <p className="body-copy mt-3 premium-muted">{t.text}</p>
        </div>
        <Link href={next} className="btn-primary w-full">
          {t.cta}
          <ArrowRight size={16} />
        </Link>
        <p className="caption premium-soft">
          {count > 0 ? `${t.redirecting} ${count}s…` : "…"}
        </p>
      </motion.div>
    </section>
  );
}
