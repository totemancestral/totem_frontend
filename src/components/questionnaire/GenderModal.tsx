"use client";

import { motion } from "motion/react";
import { Mars, Venus } from "lucide-react";

export type Gender = "homme" | "femme";

const copy = {
  fr: {
    title: "L'ancêtre qui vous répond",
    body: "Le griot doit savoir à qui il donne voix. Pour que l'ancêtre se lève à votre image, êtes-vous fils, ou fille ?",
    homme: "Un homme",
    femme: "Une femme",
  },
  en: {
    title: "The ancestor who answers you",
    body: "The griot must know whom he gives voice to. So the ancestor rises in your image, are you a son, or a daughter?",
    homme: "A man",
    femme: "A woman",
  },
} as const;

/**
 * Genre du visiteur, demandé avant la dernière question du parcours.
 *
 * Une seule réponse suffit : l'ancêtre se lève à l'image de la personne, donc
 * le même genre commande l'accord du récit sur l'ancêtre et l'adresse au
 * client (« Cher Fils », « Chère Fille »).
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
        <h2
          className="h-display text-center text-3xl uppercase"
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
            onClick={() => onChoose("homme")}
          />
          <GenderChoice
            icon={<Venus size={20} />}
            label={t.femme}
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
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
    </button>
  );
}
