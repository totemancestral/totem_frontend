"use client";
import { interfaceCopy } from "@/lib/interface-copy";
import { totemConflictMessage } from "@/lib/totem-eligibility";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/RadioCard";
import { AudioSeekBar } from "@/components/ui/AudioSeekBar";
import { RetryAfterError, retryErrorNotice, retryNotice } from "@/lib/retry-after";
import { Logo } from "@/components/ui/Logo";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";
import type { AdultAnswerState } from "@/lib/adult-answers";
import { QuestionAudioCache } from "@/lib/question-audio-cache";
import { questionAudioFallbackSrc, questionAudioSrc } from "@/lib/question-audio";
import { AdultSaveQueue, adultLocalKey, localAdultDraftSchema } from "@/lib/adult-save-queue";
import { isAdultOffer } from "@/lib/offers";
import { adultDraftSchema, adultResumeStep, hasAdultAnswersThrough, PAYMENT_AFTER_QUESTION, ADULT_QUESTION_COUNT } from "@/lib/adult-flow";

type Props = {
  dict: Dictionary["parcours"];
  lang: Locale;
  variant: "adulte" | "junior";
};

const JUNIOR_DRAFT_KEY = "totem:parcours:junior:answers";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function letterFromIndex(idx: number): AdultAnswerState["choice"] {
  return ["A", "B", "C", "D"][idx] as AdultAnswerState["choice"];
}

export default function ParcoursGriot({ dict, lang, variant }: Props) {
  const ui = interfaceCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Sans offre choisie, le choix intervient après la quatrième question.
  const requestedOffer = searchParams.get("offre");
  const offre = isAdultOffer(requestedOffer) ? requestedOffer : null;
  const requestedSession = searchParams.get("session_id");
  const requestedParcours = searchParams.get("parcours");
  const questions = variant === "junior" ? dict.questionsJunior : dict.questionsAdulte;

  const [phase, setPhase] = useState<"intro" | "question">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AdultAnswerState>>({});
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [existingTotem, setExistingTotem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootError, setBootError] = useState(false);
  const [bootRetryNotice, setBootRetryNotice] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "pending">("idle");
  const saveQueue = useRef<AdultSaveQueue<Record<string, AdultAnswerState>, string> | null>(null);
  const localContext = useRef<{ key: string; parcoursId: string | null; sessionId: string | null } | null>(null);
  const latestAnswers = useRef(answers);

  useEffect(() => {
    latestAnswers.current = answers;
    const context = localContext.current;
    if (variant !== "adulte" || checkingAuth || !context || !Object.keys(answers).length) return;
    try {
      localStorage.setItem(context.key, JSON.stringify({ ...context, answers, updatedAt: Date.now() }));
    } catch { /* Server saves remain available if browser storage is disabled. */ }
  }, [answers, checkingAuth, variant]);

  useEffect(() => {
    const retry = () => { if (saveQueue.current) void saveQueue.current.save(latestAnswers.current).catch(() => undefined); };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const questionTitleRef = useRef<HTMLHeadingElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const audioCache = useRef<QuestionAudioCache | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  useEffect(() => {
    if (!checkingAuth && !bootError && phase === "question") {
      questionTitleRef.current?.focus();
    }
  }, [phase, step, checkingAuth, bootError]);

  // Le parcours suppose un compte déjà créé (l'inscription précède la
  // traversée) : sans session valide, retour à la connexion en conservant
  // le chemin de retour.
  useEffect(() => {
    let alive = true;
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (!data.session) {
        const returnPath =
          variant === "junior"
            ? `/${lang}/parcours-junior`
            : `/${lang}/parcours?${new URLSearchParams({ ...(offre ? { offre } : {}), ...(requestedSession ? { session_id: requestedSession } : {}), ...(requestedParcours ? { parcours: requestedParcours } : {}) })}`;
        router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(returnPath)}`);
        return;
      }
      const eligibility = await fetch("/api/totem/eligibility", {
        headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store",
      });
      const permission = await eligibility.json();
      if (!alive) return;
      if (!eligibility.ok || typeof permission.allowed !== "boolean") throw new Error("eligibility_unavailable");
      if (!permission.allowed) {
        try { localStorage.removeItem(adultLocalKey(data.session.user.id)); } catch { /* optional storage */ }
        setExistingTotem(true); setCheckingAuth(false); return;
      }
      if (variant === "adulte") {
        const query = new URLSearchParams({ ...(requestedSession ? { session_id: requestedSession } : {}), ...(requestedParcours ? { parcoursId: requestedParcours } : {}) });
        const response = await fetch(`/api/parcours?${query}`, { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store" });
        if (retryNotice(response, lang)) throw new RetryAfterError(response);
        if (!response.ok) throw new Error("load_failed");
        const progress = await response.json();
        if (!alive) return;
        if (progress.completed && progress.sessionId) {
          try { localStorage.removeItem(adultLocalKey(data.session.user.id)); } catch { /* optional storage */ }
          router.replace(`/${lang}/confirmation?session_id=${encodeURIComponent(progress.sessionId)}`);
          return;
        }
        const restored = adultDraftSchema.safeParse(progress.answers);
        if (!restored.success) throw new Error("invalid_draft");
        const context = { key: adultLocalKey(data.session.user.id), parcoursId: progress.parcoursId ?? null, sessionId: progress.sessionId ?? null };
        let recovered = restored.data;
        let hasLocal = false;
        try {
          const cached = localAdultDraftSchema.safeParse(JSON.parse(localStorage.getItem(context.key) ?? "null"));
          if (cached.success && Date.now() - cached.data.updatedAt >= 7 * 86400_000) localStorage.removeItem(context.key);
          if (cached.success && Date.now() - cached.data.updatedAt < 7 * 86400_000
            && cached.data.parcoursId === context.parcoursId
            && (!cached.data.sessionId || cached.data.sessionId === context.sessionId)) {
            recovered = { ...restored.data, ...cached.data.answers };
            hasLocal = true;
          }
        } catch { /* Invalid local drafts never replace the server draft. */ }
        localContext.current = context;
        saveQueue.current = new AdultSaveQueue(async snapshot => {
          const { data: auth } = await supabase.auth.getSession();
          if (!auth.session || auth.session.user.id !== data.session!.user.id) throw new Error("session_expired");
          const saved = await fetch("/api/parcours", {
            method: "POST", signal: AbortSignal.timeout(15000),
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.session.access_token}` },
            body: JSON.stringify({ parcoursId: context.parcoursId ?? undefined, sessionId: context.sessionId ?? undefined, answers: snapshot, locale: lang }),
          });
          if (retryNotice(saved, lang)) throw new RetryAfterError(saved);
          if (!saved.ok) throw new Error("save_failed");
          const result = await saved.json();
          if (typeof result.parcoursId !== "string") throw new Error("invalid_save");
          context.parcoursId = result.parcoursId;
          try {
            const local = localAdultDraftSchema.safeParse(JSON.parse(localStorage.getItem(context.key) ?? "null"));
            if (local.success) {
              if (JSON.stringify(local.data.answers) === JSON.stringify(snapshot)) localStorage.removeItem(context.key);
              else localStorage.setItem(context.key, JSON.stringify({ ...local.data, parcoursId: result.parcoursId, sessionId: context.sessionId }));
            }
          } catch { /* Saving on the server does not depend on local storage. */ }
          return result.parcoursId as string;
        }, status => {
          if (alive) setSaveStatus(status);
        });
        if (hasLocal) setSaveStatus("pending");
        const restoredAnswers = progress.paid ? recovered : Object.fromEntries(Object.entries(recovered).filter(([key]) => Number(key) <= PAYMENT_AFTER_QUESTION));
        setAnswers(restoredAnswers);
        setPaymentSession(progress.sessionId ?? null);
        setPaid(progress.paid === true);
        setStep(adultResumeStep(restoredAnswers, progress.paid === true));
        if (progress.parcoursId || hasLocal) setPhase("question");
      }
      if (alive) setCheckingAuth(false);
    }
    void load().catch((error) => { if (alive) { setBootRetryNotice(retryErrorNotice(error, lang)); setBootError(true); setCheckingAuth(false); } });
    return () => {
      alive = false;
    };
  }, [lang, offre, router, variant, requestedSession, requestedParcours]);

  const current = questions[step] as (typeof questions)[number] & {
    griot?: string;
    fieldLabel?: string;
    fieldPlaceholder?: string;
  };
  const isLast = step === questions.length - 1;

  useEffect(() => {
    const cache = new QuestionAudioCache();
    audioCache.current = cache;
    return () => { cache.dispose(); audioCache.current = null; };
  }, []);

  useEffect(() => {
    const media = audioRef.current;
    return () => { media?.pause(); };
  }, [checkingAuth, bootError, existingTotem]);

  // Keep the same media element and call play synchronously inside navigation
  // gestures. The effect only starts restored questions, never reloads a tap.
  function playQuestion(index: number) {
    const el = audioRef.current;
    if (!el) return;
    const source = questionAudioSrc(variant, index + 1, lang);
    if (el.dataset.question !== source) {
      el.pause();
      el.dataset.question = source;
      el.src = audioCache.current?.source(source) ?? source;
      el.load();
      setAudioProgress(0);
    }
    setAudioLoading(true);
    void el.play().catch(() => { setAudioPlaying(false); setAudioLoading(false); });
  }

  useEffect(() => {
    if (checkingAuth || bootError || existingTotem) return;
    const source = questionAudioSrc(variant, step + 1, lang);
    const next = step + 1 < questions.length ? questionAudioSrc(variant, step + 2, lang) : null;
    if (phase === "intro") audioCache.current?.prepare([source]);
    else {
      if (audioRef.current?.dataset.question !== source) {
        const el = audioRef.current;
        if (el) {
          el.dataset.question = source;
          el.src = audioCache.current?.source(source) ?? source;
          el.load();
          void el.play().catch(() => { setAudioPlaying(false); setAudioLoading(false); });
        }
      }
      audioCache.current?.prepare(next ? [source, next] : [source], next ? [next] : []);
    }
  }, [phase, step, variant, lang, checkingAuth, bootError, existingTotem, questions.length]);

  function advanceQuestion(index: number) {
    playQuestion(index);
    setStep(index);
  }

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
    if (step > 0) advanceQuestion(step - 1);
  }

  async function goNext() {
    if (submitting) return;
    stopAudio();
    setError(null);
    if (variant === "adulte" && !isLast && (paid || step + 1 < PAYMENT_AFTER_QUESTION)) {
      if (!saveQueue.current) { setError(dict.saveError); return; }
      void saveQueue.current.save(answers).catch(() => undefined);
      advanceQuestion(step + 1);
      return;
    }
    setSubmitting(true);
    try {
      if (variant === "junior") {
        if (!isLast) { advanceQuestion(step + 1); return; }
        if (Object.keys(answers).length < questions.length) { setError(dict.incompleteError); return; }
        sessionStorage.setItem(JUNIOR_DRAFT_KEY, JSON.stringify(answers));
        router.push(`/${lang}/paiement-junior`);
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("session_expired");
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` };
        if (!saveQueue.current) throw new Error("save_unavailable");
        const savedParcoursId = await saveQueue.current.save(answers);

        if (!paid && step + 1 >= PAYMENT_AFTER_QUESTION) {
          if (!hasAdultAnswersThrough(answers, PAYMENT_AFTER_QUESTION)) { setError(dict.incompleteError); return; }
          const query = new URLSearchParams({ parcours: savedParcoursId, ...(offre ? { offre } : {}) });
          router.push(`/${lang}/${offre ? "paiement" : "choisir-offre"}?${query}`);
          return;
        }
        if (!isLast) { advanceQuestion(step + 1); return; }
        if (!hasAdultAnswersThrough(answers, ADULT_QUESTION_COUNT)) { setError(dict.incompleteError); return; }
        const completed = await fetch("/api/orders/complete", {
          method: "POST", headers,
          body: JSON.stringify({ parcoursId: savedParcoursId, sessionId: paymentSession, answers, locale: lang }),
        });
        if (retryNotice(completed, lang)) throw new RetryAfterError(completed);
        if (!completed.ok) throw new Error("completion_failed");
        try { if (localContext.current) localStorage.removeItem(localContext.current.key); } catch { /* optional storage */ }
        router.push(`/${lang}/confirmation?session_id=${encodeURIComponent(paymentSession!)}`);
      }
    } catch (error) {
      setError(retryErrorNotice(error, lang) ?? dict.saveError);
    } finally {
      setSubmitting(false);
    }
  }

  let audioLabel = dict.audioListen;
  if (audioPlaying) audioLabel = dict.audioPlaying;
  else if (audioProgress > 0 && audioProgress < 100) audioLabel = dict.audioPaused;

  if (checkingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-nuit px-6 text-ivoire"><p role="status">{ui.status.loadingQuestionnaire}</p></div>;
  }
  if (existingTotem) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-nuit px-6 text-center text-ivoire">
      <p role="status">{totemConflictMessage("totem_already_exists", lang)}</p>
      <Button href={`/${lang}/espace`}>{lang === "en" ? "Go to my space" : "Accéder à mon espace"}</Button>
    </div>;
  }
  if (bootError) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-nuit px-6 text-ivoire">
      <p role="alert">{bootRetryNotice ?? dict.loadError}</p>
      <Button onClick={() => window.location.reload()}>{dict.retryLabel}</Button>
    </div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit">
      <audio ref={audioRef} preload="auto"
        onTimeUpdate={e => { const el = e.currentTarget; if (el.duration) setAudioProgress(Math.min(100, Math.round(el.currentTime / el.duration * 100))); }}
        onPlay={() => setAudioLoading(true)}
        onPlaying={() => { setAudioPlaying(true); setAudioLoading(false); }}
        onWaiting={() => setAudioLoading(true)}
        onPause={() => { setAudioPlaying(false); setAudioLoading(false); }}
        onEnded={() => { setAudioPlaying(false); setAudioLoading(false); setAudioProgress(100); }}
        onError={e => {
          const el = e.currentTarget;
          const fallback = questionAudioFallbackSrc(variant, step + 1);
          if (el.dataset.fallback === el.dataset.question || lang !== "en") { setAudioLoading(false); setAudioPlaying(false); return; }
          el.dataset.fallback = el.dataset.question;
          el.src = fallback;
          el.load();
          void el.play().catch(() => { setAudioPlaying(false); setAudioLoading(false); });
        }} />
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
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-8 lg:px-14">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Brand lang={lang} />
          {variant === "junior" && (
            <span className="ml-1 bg-or px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nuit">
              {dict.badgeJunior}
            </span>
          )}
        </div>
        <Link href={`/${lang}/espace`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
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
          <Button onClick={() => { playQuestion(step); setPhase("question"); }}>{dict.introCta}</Button>
        </div>
      ) : (
        <>
          {/* contenu principal */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-9 px-6 py-8 text-center lg:px-14">
            <span id="question-position" className="text-xs uppercase tracking-[0.2em] text-or">
              {dict.questionLabel} {pad(step + 1)} / {pad(questions.length)}
            </span>

            {current.griot && (
              <p className="font-display max-w-2xl text-lg italic leading-snug text-orpale lg:text-xl">
                {current.griot}
              </p>
            )}

            <h1 ref={questionTitleRef} id="question-title" tabIndex={-1} aria-describedby="question-position" className="font-display max-w-3xl text-2xl leading-tight text-ivoire focus:outline-2 focus:outline-offset-4 focus:outline-or lg:text-5xl">
              {current.q}
            </h1>

            {/* contrôle audio : la voix du griot lit la question */}
            {audioLoading && <p className="text-sm text-grisclair" role="status">{lang === "fr" ? "Chargement de l'audio\u2026" : "Loading audio\u2026"}</p>}
            <div className="-mt-3 flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
              <button type="button"
                onClick={restartAudio}
                aria-label={dict.audioRestart}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ombre"
              >
                <svg width="14" height="12" viewBox="0 0 16 14" aria-hidden="true">
                  <polygon points="8,0 8,14 0,7" fill="none" stroke="#888888" strokeWidth="1.3" strokeLinejoin="round" />
                  <polygon points="16,0 16,14 8,7" fill="none" stroke="#888888" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button"
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
              <span className="shrink-0 truncate text-xs text-grisclair">{audioLabel}</span>
              <AudioSeekBar audioRef={audioRef} lang={lang} />
            </div>

            {/* options */}
            <fieldset aria-labelledby="question-title" className="grid w-full min-w-0 max-w-3xl grid-cols-1 gap-4.5 sm:grid-cols-2">
              {current.options.map((opt, idx) => {
                const isSelected = currentAnswer?.choice === letterFromIndex(idx);
                return (
                  <RadioCard
                    key={`${questionKey}-${idx}`}
                    name={`question-${questionKey}`}
                    value={String.fromCharCode(65 + idx)}
                    disabled={submitting}
                    onChange={() => pick(idx)}
                    checked={isSelected}
                    className={`flex items-start gap-3 border p-5.5 text-left transition-colors duration-300 lg:px-6.5 lg:py-5.5 ${
                      isSelected ? "border-or bg-indigo text-ivoire" : "border-ombre bg-transparent text-grisclair hover:border-orpale"
                    }`}
                  >
                    <span className="font-display shrink-0 text-base text-or lg:text-lg">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="text-base lg:text-lg">{opt}</span>
                  </RadioCard>
                );
              })}
            </fieldset>

            {variant === "adulte" && (
              <div className="flex w-full max-w-3xl flex-col gap-2">
                <label htmlFor="question-detail" className="text-left text-xs text-grisclair">{current.fieldLabel ?? dict.wordMorePlaceholder}</label>
                <textarea
                  id="question-detail"
                  rows={1}
                  disabled={submitting}
                  value={currentAnswer?.field ?? ""}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder={current.fieldPlaceholder ?? dict.wordMorePlaceholder}
                  maxLength={3996}
                  className="w-full resize-none border border-ombre bg-indigo px-4 py-4 text-sm text-grisclair placeholder:text-grisclair"
                />
              </div>
            )}

            {error && (
              <p ref={errorRef} tabIndex={-1} className="text-sm focus:outline-2 focus:outline-offset-4 focus:outline-or" style={{ color: "#EF9388" }} role="alert">
                {error}
              </p>
            )}
            {variant === "adulte" && !paid && step + 1 === PAYMENT_AFTER_QUESTION && (
              <p className="max-w-xl text-sm text-grisclair">{dict.paymentNotice}</p>
            )}
          </div>

          {variant === "adulte" && saveStatus !== "idle" && <div className="px-6 text-sm text-grisclair lg:px-14" role="status" aria-live="polite">
            {saveStatus === "pending" ? <>
              <span>{lang === "fr" ? "Sauvegarde en attente. Vos réponses restent dans ce navigateur si le stockage est disponible." : "Save pending. Your answers stay in this browser if storage is available."}</span>{" "}
              <button type="button" className="text-or underline" disabled={submitting} onClick={() => { void saveQueue.current?.save(answers).catch(() => undefined); }}>
                {lang === "fr" ? "Réessayer" : "Retry"}
              </button>
            </> : saveStatus === "saving" ? (lang === "fr" ? "Sauvegarde en cours…" : "Saving…") : (lang === "fr" ? "Réponses enregistrées" : "Answers saved")}
          </div>}
          {/* navigation basse */}
          <p role="status" className="sr-only">{submitting ? (ui.status.savingAnswers) : ""}</p>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5 px-6 pt-8 pb-24 lg:px-14 lg:pb-8">
            <button type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
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
            <Button onClick={goNext} disabled={!currentAnswer?.choice || submitting} aria-busy={submitting}>
              {submitting ? (ui.status.savingAnswers) : variant === "adulte" && !paid && step + 1 === PAYMENT_AFTER_QUESTION ? dict.paymentContinueLabel : isLast ? dict.revealLabel : dict.continueLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
