"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";
import type { AdultAnswerState } from "@/lib/adult-answers";
import { questionAudioFallbackSrc, questionAudioSrc } from "@/lib/question-audio";

type Props = {
  dict: Dictionary["parcours"];
  lang: Locale;
  variant: "adulte" | "junior";
};

const DRAFT_KEY = "totem:parcours:answers";
const JUNIOR_DRAFT_KEY = "totem:parcours:junior:answers";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function letterFromIndex(idx: number): AdultAnswerState["choice"] {
  return ["A", "B", "C", "D"][idx] as AdultAnswerState["choice"];
}

export default function ParcoursGriot({ dict, lang, variant }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offre = searchParams.get("offre") ?? "ancestral";
  const questions = variant === "junior" ? dict.questionsJunior : dict.questionsAdulte;

  const [phase, setPhase] = useState<"intro" | "question">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AdultAnswerState>>({});
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Le parcours suppose un compte déjà créé (l'inscription précède la
  // traversée) : sans session valide, retour à la connexion en conservant
  // le chemin de retour.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (!data.session) {
        const returnPath = variant === "junior" ? `/${lang}/parcours-junior` : `/${lang}/parcours?offre=${offre}`;
        router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(returnPath)}`);
        return;
      }
      setCheckingAuth(false);
    });
    return () => {
      alive = false;
    };
  }, [lang, offre, router, variant]);

  const current = questions[step] as (typeof questions)[number] & {
    griot?: string;
    fieldLabel?: string;
    fieldPlaceholder?: string;
  };
  const isLast = step === questions.length - 1;

  // Voix pré-enregistrée du griot pour chaque question (fichiers réels dans
  // public/assets/{adulte|junior}/qN.mp3). Se recharge et tente l'autoplay à
  // chaque changement de question — l'autoplay avec son ne fonctionne qu'après
  // un premier geste utilisateur (déjà obtenu via "Je commence mon voyage"),
  // sinon le bouton play sert de secours.
  useEffect(() => {
    if (phase !== "question") return;
    const el = audioRef.current;
    if (!el) return;
    const src = questionAudioSrc(variant, step + 1, lang);
    setAudioSrc(src);
    setAudioProgress(0);
    el.src = src;
    el.load();
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
    }
  }, [phase, step, variant, lang]);

  function toggleAudio() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (el.ended) el.currentTime = 0;
      const promise = el.play();
      if (promise && typeof promise.then === "function") {
        promise.then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
      } else {
        setAudioPlaying(true);
      }
    } else {
      el.pause();
      setAudioPlaying(false);
    }
  }

  function restartAudio() {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
    }
  }

  function stopAudio() {
    audioRef.current?.pause();
    setAudioPlaying(false);
    setAudioProgress(0);
  }

  const questionKey = String(step + 1);
  const currentAnswer = answers[questionKey];

  function pick(idx: number) {
    setAnswers((prev) => ({ ...prev, [questionKey]: { ...prev[questionKey], choice: letterFromIndex(idx) } }));
  }

  function setFreeText(value: string) {
    setAnswers((prev) => ({ ...prev, [questionKey]: { ...prev[questionKey], field: value } }));
  }

  function goBack() {
    stopAudio();
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  async function goNext() {
    stopAudio();
    setError(null);

    if (!isLast) {
      setStep(step + 1);
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      setError(dict.incompleteError ?? "Réponds à toutes les questions avant de continuer.");
      return;
    }

    setSubmitting(true);
    try {
      if (variant === "junior") {
        sessionStorage.setItem(JUNIOR_DRAFT_KEY, JSON.stringify(answers));
        router.push(`/${lang}/paiement-junior`);
      } else {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
        router.push(`/${lang}/paiement?offre=${offre}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  let audioLabel = dict.audioListen;
  if (audioPlaying) audioLabel = dict.audioPlaying;
  else if (audioProgress > 0 && audioProgress < 100) audioLabel = dict.audioPaused;

  if (checkingAuth) {
    return <div className="min-h-screen bg-nuit" />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit">
      {/* motif tournant en arrière-plan */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_120s_linear_infinite] opacity-35"
        viewBox="0 0 760 760"
      >
        <g stroke="#C9A84C" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.08" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.08" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.08" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.08" />
          <line x1="380" y1="380" x2="592" y2="88" opacity="0.06" />
          <line x1="380" y1="380" x2="592" y2="672" opacity="0.06" />
          <line x1="380" y1="380" x2="168" y2="672" opacity="0.06" />
          <line x1="380" y1="380" x2="168" y2="88" opacity="0.06" />
          <line x1="380" y1="380" x2="486" y2="52" opacity="0.05" />
          <line x1="380" y1="380" x2="708" y2="274" opacity="0.05" />
          <line x1="380" y1="380" x2="708" y2="486" opacity="0.05" />
          <line x1="380" y1="380" x2="486" y2="708" opacity="0.05" />
          <line x1="380" y1="380" x2="274" y2="708" opacity="0.05" />
          <line x1="380" y1="380" x2="52" y2="486" opacity="0.05" />
          <line x1="380" y1="380" x2="52" y2="274" opacity="0.05" />
          <line x1="380" y1="380" x2="274" y2="52" opacity="0.05" />
        </g>
      </svg>

      {/* barre du haut */}
      <div className="relative z-10 flex items-center justify-between px-6 py-8 lg:px-14">
        <div className="flex items-center gap-3">
          <Brand lang={lang} />
          {variant === "junior" && (
            <span className="ml-1 bg-or px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nuit">
              {dict.badgeJunior}
            </span>
          )}
        </div>
        <Link href={`/${lang}`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.later}
        </Link>
      </div>

      {/* barre de progression */}
      <div className="relative z-10 mx-6 h-px bg-ombre lg:mx-14">
        {phase === "question" && (
          <div
            className="h-px bg-or transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(((step + 1) / questions.length) * 100)}%` }}
          />
        )}
      </div>

      {phase === "intro" ? (
        /* écran d'introduction : prépare le visiteur avant la première question */
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center lg:px-14">
          <Logo size={64} />
          <h1 className="font-display text-3xl uppercase tracking-wide text-ivoire lg:text-4xl">
            {dict.introTitle}
          </h1>
          <div className="flex max-w-xl flex-col gap-5">
            <p className="font-display text-lg italic leading-relaxed text-orpale lg:text-xl">
              {dict.introParagraph1}
            </p>
            <p className="text-sm leading-relaxed text-grisclair lg:text-base">{dict.introParagraph2}</p>
            <p className="text-sm leading-relaxed text-grisclair lg:text-base">{dict.introParagraph3}</p>
          </div>
          <Button onClick={() => setPhase("question")}>{dict.introCta}</Button>
        </div>
      ) : (
        <>
          {/* contenu principal */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-9 px-6 py-8 text-center lg:px-14">
            <span className="text-xs uppercase tracking-[0.2em] text-or">
              {dict.questionLabel} {pad(step + 1)} / {pad(questions.length)}
            </span>

            {current.griot && (
              <p className="font-display max-w-2xl text-lg italic leading-snug text-orpale lg:text-xl">
                {current.griot}
              </p>
            )}

            <h1 className="font-display max-w-3xl text-2xl leading-tight text-ivoire lg:text-5xl">
              {current.q}
            </h1>

            {/* contrôle audio : la voix du griot lit la question */}
            <audio
              ref={audioRef}
              src={audioSrc || undefined}
              preload="auto"
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (el.duration) setAudioProgress(Math.min(100, Math.round((el.currentTime / el.duration) * 100)));
              }}
              onPlay={() => setAudioPlaying(true)}
              onPause={() => setAudioPlaying(false)}
              onEnded={() => {
                setAudioPlaying(false);
                setAudioProgress(100);
              }}
              onError={(e) => {
                const fallback = questionAudioFallbackSrc(variant, step + 1);
                if (audioSrc === fallback) return;
                setAudioSrc(fallback);
                const el = e.currentTarget;
                el.src = fallback;
                el.load();
                el.play().catch(() => undefined);
              }}
            />
            <div className="-mt-3 flex w-full max-w-xs items-center gap-2.5 lg:max-w-none lg:justify-center lg:gap-4">
              <button
                onClick={restartAudio}
                aria-label={dict.audioRestart}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ombre"
              >
                <svg width="14" height="12" viewBox="0 0 16 14" aria-hidden="true">
                  <polygon points="8,0 8,14 0,7" fill="none" stroke="#888888" strokeWidth="1.3" strokeLinejoin="round" />
                  <polygon points="16,0 16,14 8,7" fill="none" stroke="#888888" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={toggleAudio}
                aria-label={audioPlaying ? dict.audioPauseAction : dict.audioPlayAction}
                aria-pressed={audioPlaying}
                className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full border border-or"
              >
                {audioPlaying ? (
                  <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                    <rect x="1" y="0" width="4" height="16" fill="#C9A84C" />
                    <rect x="9" y="0" width="4" height="16" fill="#C9A84C" />
                  </svg>
                ) : (
                  <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                    <polygon points="0,0 14,8 0,16" fill="#C9A84C" />
                  </svg>
                )}
              </button>
              <div className="relative h-px min-w-10 flex-1 bg-ombre lg:w-45 lg:flex-none">
                <div className="h-px bg-or transition-[width] duration-150 ease-linear" style={{ width: `${audioProgress}%` }} />
              </div>
              <span className="shrink-0 truncate text-xs text-grisclair">{audioLabel}</span>
            </div>

            {/* options */}
            <div className="grid w-full max-w-3xl grid-cols-1 gap-4.5 sm:grid-cols-2">
              {current.options.map((opt, idx) => {
                const isSelected = currentAnswer?.choice === letterFromIndex(idx);
                return (
                  <button
                    key={opt}
                    onClick={() => pick(idx)}
                    aria-pressed={isSelected}
                    className={`flex items-start gap-3 border p-5.5 text-left transition-colors duration-300 lg:px-6.5 lg:py-5.5 ${
                      isSelected ? "border-or bg-indigo text-ivoire" : "border-ombre bg-transparent text-grisclair hover:border-orpale"
                    }`}
                  >
                    <span className="font-display shrink-0 text-base text-or lg:text-lg">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="text-base lg:text-lg">{opt}</span>
                  </button>
                );
              })}
            </div>

            {variant === "adulte" && (
              <div className="flex w-full max-w-3xl flex-col gap-2">
                {current.fieldLabel && (
                  <span className="text-left text-xs text-grisclair">{current.fieldLabel}</span>
                )}
                <textarea
                  rows={1}
                  value={currentAnswer?.field ?? ""}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder={current.fieldPlaceholder ?? dict.wordMorePlaceholder}
                  maxLength={4000}
                  className="w-full resize-none border border-ombre bg-indigo px-4 py-4 text-sm text-grisclair placeholder:text-grisclair"
                />
              </div>
            )}

            {error && (
              <p className="text-sm" style={{ color: "#B0473E" }} role="alert">
                {error}
              </p>
            )}
          </div>

          {/* navigation basse */}
          <div className="relative z-10 flex items-center justify-between px-6 py-8 lg:px-14">
            <button
              onClick={goBack}
              disabled={step === 0}
              className={`flex items-center gap-2.5 text-sm uppercase tracking-wide text-grisclair ${
                step === 0 ? "pointer-events-none opacity-30" : "opacity-100"
              }`}
            >
              <svg width="14" height="10" viewBox="0 0 16 10" fill="none" stroke="#888888" strokeWidth="1.4">
                <line x1="16" y1="5" x2="2" y2="5" />
                <polyline points="7,1 1,5 7,9" />
              </svg>
              {dict.back}
            </button>
            <Button onClick={goNext} disabled={!currentAnswer?.choice || submitting}>
              {submitting ? "…" : isLast ? dict.revealLabel : dict.continueLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
