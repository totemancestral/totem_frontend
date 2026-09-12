"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";

type Phase = "floating" | "falling" | "revealed";

// animation de flottement + délai, avant le tirage. La posture "tombée" de
// chaque cauri, elle, est tirée au hasard à chaque clic (voir randomFallenPose).
const shells = [
  { floatAnim: "cauri-float-1 4.6s ease-in-out infinite", delay: "0s" },
  { floatAnim: "cauri-float-2 5.2s ease-in-out infinite", delay: "0.06s" },
  { floatAnim: "cauri-float-3 4.9s ease-in-out infinite", delay: "0.12s" },
  { floatAnim: "cauri-float-1 5.0s ease-in-out infinite", delay: "0.18s" },
  { floatAnim: "cauri-float-2 4.7s ease-in-out infinite", delay: "0.24s" },
  { floatAnim: "cauri-float-3 5.4s ease-in-out infinite", delay: "0.3s" },
];

// Rotation quelconque (0-360°) et léger décalage vers le bas : un vrai tirage
// aléatoire à chaque clic, pas une chute déjà écrite à l'avance.
function randomFallenPose() {
  const rotate = Math.round(Math.random() * 360 - 180);
  const x = Math.round(Math.random() * 20 - 10);
  const y = Math.round(Math.random() * 14 + 6);
  return `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
}

type Face = "open" | "closed";

// Une fois retombé, chaque cauri se révèle ouvert (face nacrée) ou fermé
// (dos renversé) — entièrement au hasard, indépendamment pour chacun.
function randomFace(): Face {
  return Math.random() < 0.5 ? "open" : "closed";
}

const FACE_IMAGE: Record<Face, string> = {
  open: "/images/cauris_site_trimmed.png",
  closed: "/images/cauris_renversee_trimmed.png",
};

function CauriShell({ face = "open" }: { face?: Face }) {
  return (
    <div className="relative h-[38px] w-[58px]">
      {/* pas de mix-blend-mode ici : sur un PNG transparent, le fond
          "duotone + surcouche or" utilisé ailleurs sur le site (pensé pour
          des photos opaques) fait apparaître un rectangle plein derrière le
          sujet. On garde donc la teinte naturelle du cauri (déjà proche de
          l'or/ivoire du site) et on la pousse avec de simples filtres CSS,
          qui eux respectent la transparence. */}
      <Image
        src={FACE_IMAGE[face]}
        alt=""
        fill
        sizes="58px"
        className="object-contain contrast-[1.1] brightness-105 saturate-[1.15] drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}

export default function ConsultationTirage({ dict, lang }: { dict: Dictionary["consultationTirage"]; lang: Locale }) {
  const { commandes } = useCommandes();
  const hasWork = (commandes ?? []).some((c) => c.oeuvre);
  const [phase, setPhase] = useState<Phase>("floating");
  const [fallenPoses, setFallenPoses] = useState<string[]>(() => shells.map(randomFallenPose));
  const [shellFaces, setShellFaces] = useState<Face[]>(() => shells.map(randomFace));
  const [showComposePrompt, setShowComposePrompt] = useState(false);
  const isFloating = phase === "floating";
  const isRevealed = phase === "revealed";

  function cast() {
    if (phase !== "floating") return;
    // La consultation est un rituel sur un Totem déjà composé — on ne tire
    // les cauris que si l'oeuvre existe déjà, sinon on incite à la composer.
    if (!hasWork) {
      setShowComposePrompt(true);
      return;
    }
    setFallenPoses(shells.map(randomFallenPose));
    setShellFaces(shells.map(randomFace));
    setPhase("falling");
    setTimeout(() => setPhase("revealed"), 700);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit">
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_120s_linear_infinite] opacity-30"
        viewBox="0 0 760 760"
      >
        <g stroke="#C9A84C" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.08" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.08" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.08" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.08" />
        </g>
      </svg>

      {/* barre du haut */}
      <div className="relative z-20 flex items-center justify-between px-6 py-8 lg:px-14">
        <Brand lang={lang} />
        <Link href={`/${lang}/consultations`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.quit}
        </Link>
      </div>

      {/* plateau : centré, en colonne, s'adapte à n'importe quelle taille d'écran */}
      <div
        onClick={cast}
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10 text-center cursor-pointer"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</span>

        {/* les six cauris : toujours visibles, flottent puis retombent chacun différemment */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-7 sm:gap-x-10">
          {shells.map((shell, i) => (
            <div
              key={i}
              className="flex items-center justify-center transition-transform duration-700 ease-out"
              style={{
                animation: isFloating ? shell.floatAnim : "none",
                transform: isFloating ? undefined : fallenPoses[i],
                transitionDelay: shell.delay,
              }}
            >
              <CauriShell face={isFloating ? "open" : shellFaces[i]} />
            </div>
          ))}
        </div>

        {isFloating && (
          <p className="font-display max-w-sm animate-[instr-pulse_2.4s_ease-in-out_infinite] text-lg italic text-orpale">
            {dict.instruction}
          </p>
        )}

        {isRevealed && (
          <div className="flex w-full max-w-xl flex-col items-center gap-4.5">
            <span className="text-xs uppercase tracking-[0.18em] text-or">{dict.readingLabel}</span>
            <p className="font-display text-lg italic leading-relaxed text-ivoire lg:text-xl">{dict.reading}</p>
            <div className="mt-2 flex gap-5">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setPhase("floating");
                }}
                className="cursor-pointer border-b border-ombre pb-0.5 text-xs uppercase tracking-wide text-grisclair"
              >
                {dict.resetLink}
              </span>
              <Link
                href={`/${lang}/consultations`}
                onClick={(e) => e.stopPropagation()}
                className="border-b border-or pb-0.5 text-xs uppercase tracking-wide text-or"
              >
                {dict.backLink}
              </Link>
            </div>
          </div>
        )}

        {/* invite à composer : la consultation est un rituel sur un Totem
            déjà composé — on ne bloque pas l'accès à la page, seulement
            le tirage lui-même, avec un appel à l'action plutôt qu'un mur. */}
        {showComposePrompt && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-30 flex cursor-default flex-col items-center justify-center gap-6 bg-nuit/95 px-6 text-center"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</span>
            <h2 className="font-display max-w-sm text-2xl italic text-ivoire">{dict.composePromptTitle}</h2>
            <p className="max-w-sm text-sm text-grisclair">{dict.composePromptText}</p>
            <div className="mt-2 flex flex-col items-center gap-5 sm:flex-row">
              <Button href={`/${lang}/offres`}>{dict.composePromptCta}</Button>
              <Link
                href={`/${lang}/consultations`}
                className="border-b border-ombre pb-0.5 text-xs uppercase tracking-wide text-grisclair"
              >
                {dict.quit}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
