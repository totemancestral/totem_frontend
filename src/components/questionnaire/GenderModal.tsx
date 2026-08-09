"use client";

import { motion } from "motion/react";
import { Mars, Venus } from "lucide-react";

export type Gender = "homme" | "femme";

const copy = {
  fr: {
    eyebrow: "Dernier signe",
    title: "L'ancêtre qui vous répond",
    body: "Le griot doit savoir à qui il donne voix : votre ancêtre était-il un homme ou une femme ? Sans cela, le récit reste au neutre.",
    homme: "Un homme",
    femme: "Une femme",
    hommeHint: "Le récit sera accordé au masculin",
    femmeHint: "Le récit sera accordé au féminin",
  },
  en: {
    eyebrow: "Last sign",
    title: "The ancestor who answers you",
    body: "The griot must know whom he gives voice to: was your ancestor a man or a woman? Without this, the story stays neutral.",
    homme: "A man",
    femme: "A woman",
    hommeHint: "The story will be written in the masculine",
    femmeHint: "The story will be written in the feminine",
  },
} as const;

/**
 * Choix du sexe de l'ancêtre, demandé avant la dernière question du parcours.
 *
 * Le récit et le portrait sont générés au genre choisi : sans cette réponse,
 * le griot écrit au neutre et l'ancêtre reste indéterminé.
 */
export function GenderModal({
  locale,
  onChoose,
}: {
  locale: "fr" | "en";
  onChoose: (gender: Gender) => void;
}) {
  const t = copy[locale];

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center overflow-y-auto px-4 py-8"
      style={{ background: "rgba(0,0,0,0.74)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="premium-panel-strong my-auto w-full max-w-md p-6 sm:p-8"
      >
        <p className="eyebrow text-center" style={{ color: "var(--or-ancestral)" }}>
          {t.eyebrow}
        </p>
        <h2
          className="h-display mt-3 text-center text-3xl uppercase"
          style={{ color: "var(--ivoire)" }}
        >
          {t.title}
        </h2>
        <p className="mt-4 text-center text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.68)" }}>
          {t.body}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <GenderChoice
            icon={<Mars size={20} />}
            label={t.homme}
            hint={t.hommeHint}
            onClick={() => onChoose("homme")}
          />
          <GenderChoice
            icon={<Venus size={20} />}
            label={t.femme}
            hint={t.femmeHint}
            onClick={() => onChoose("femme")}
          />
        </div>
      </motion.div>
    </div>
  );
}

function GenderChoice({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border px-5 py-6 text-center transition-all hover:bg-ombre"
      style={{ borderColor: "rgba(216,173,77,0.28)", background: "rgba(13,13,26,0.5)" }}
    >
      <span style={{ color: "var(--or-ancestral)" }}>{icon}</span>
      <span
        className="text-base uppercase tracking-wide"
        style={{ fontFamily: "var(--font-display)", color: "var(--ivoire)" }}
      >
        {label}
      </span>
      <span className="text-[11px] leading-snug" style={{ color: "rgba(226,225,238,0.55)" }}>
        {hint}
      </span>
    </button>
  );
}
