"use client";
import { interfaceCopy, formatInterface } from "@/lib/interface-copy";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Brand } from "@/components/ui/Brand";
import { AudioSeekBar } from "@/components/ui/AudioSeekBar";
import { parchmentParagraphs } from "@/lib/parchment-text";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";
import { retryNotice } from "@/lib/retry-after";
import { REQUEST_TIMING, requestSignal } from "@/lib/request-timing";

type Phase = "loading" | "closed" | "open";

type OeuvreData = {
  nom_totem: string | null;
  recit: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  certificate_url: string | null;
  numero_serie: string | null;
  statut: string;
  created_at: string;
};

type FetchStatus = "loading" | "pending" | "ready" | "notfound" | "error" | "delayed";

function formatDate(iso: string, lang: Locale) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Affiche une seule version du récit, y compris pour les anciens miroirs. */
function splitRecit(recit: string): { title: string | null; text: string }[] {
  return parchmentParagraphs(recit).map(text => ({ title: null, text }));
}

export default function Oeuvre({ dict, lang }: { dict: Dictionary["oeuvre"]; lang: Locale }) {
  const ui = interfaceCopy(lang);
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commande");

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(commandeId ? "loading" : "notfound");
  const [delayNotice, setDelayNotice] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<OeuvreData | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [shareNotice, setShareNotice] = useState(false);

  useEffect(() => {
    if (!commandeId) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    let phaseTimer: ReturnType<typeof setTimeout>;
    let lastRefresh = 0;
    let paused = false;
    let inFlight = false;
    const controller = new AbortController();
    let windowTimer: ReturnType<typeof setTimeout>;
    let waiting = false;
    function startBudget() {
      waiting = true;
      windowTimer = setTimeout(() => {
      paused = true;
      controller.abort();
      clearTimeout(timer);
      if (alive) setFetchStatus("delayed");
      }, REQUEST_TIMING.artworkWindow);
    }
    startBudget();

    async function poll() {
      if (!alive || paused || inFlight) return;
      inFlight = true;
      try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!alive || controller.signal.aborted) return;
      if (!token) {
        clearTimeout(windowTimer);
        paused = true;
        if (alive) setFetchStatus("error");
        return;
      }

        const response = await fetch(`/api/oeuvre/${commandeId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: requestSignal(REQUEST_TIMING.read, controller.signal),
        });
        if (!alive || controller.signal.aborted) return;

        if (response.status === 404) {
          clearTimeout(windowTimer);
          paused = true;
          setFetchStatus("notfound");
          return;
        }
        if (!response.ok) {
          clearTimeout(windowTimer);
          paused = true;
          setDelayNotice(retryNotice(response, lang));
          setFetchStatus("error");
          return;
        }

        const payload = (await response.json()) as { oeuvre: OeuvreData | null };
        if (payload.oeuvre) {
          if (!alive || controller.signal.aborted) return;
          clearTimeout(windowTimer);
          waiting = false;
          lastRefresh = Date.now();
          setData(payload.oeuvre);
          setFetchStatus("ready");
          // Le griot "termine l'écriture" un court instant avant que le
          // parchemin ne soit disponible — mise en scène plutôt que technique.
          clearTimeout(phaseTimer);
          phaseTimer = setTimeout(() => setPhase((current) => (current === "loading" ? "closed" : current)), 1200);
          // Renouveler avant l'expiration même si la page reste ouverte.
          timer = setTimeout(poll, 45 * 60_000);
        } else {
          if (!waiting) startBudget();
          setFetchStatus("pending");
          timer = setTimeout(poll, REQUEST_TIMING.artworkInterval);
        }
      } catch {
        if (alive && !controller.signal.aborted) { paused = true; setFetchStatus("error"); clearTimeout(windowTimer); }
      } finally { inFlight = false; }
    }

    poll();
    const refreshOnReturn = () => {
      if (!paused && document.visibilityState === "visible" && Date.now() - lastRefresh >= 30 * 60_000) {
        clearTimeout(timer);
        void poll();
      }
    };
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(windowTimer);
      clearTimeout(timer);
      clearTimeout(phaseTimer);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [commandeId, lang, revision]);

  function openScroll() {
    if (phase !== "closed") return;
    setPhase("open");
  }

  function toggleAudio() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (el.ended) el.currentTime = 0;
      el.play()
        .then(() => setAudioPlaying(true))
        .catch(() => setAudioPlaying(false));
    } else {
      el.pause();
      setAudioPlaying(false);
    }
  }

  function restartAudio() {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play()
      .then(() => setAudioPlaying(true))
      .catch(() => setAudioPlaying(false));
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 2500);
    } catch {
      /* noop */
    }
  }

  const isOpen = phase === "open";
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen) scrollRef.current?.focus({ preventScroll: true }); }, [isOpen]);
  let audioLabel = dict.audioListen;
  if (audioPlaying) audioLabel = dict.audioPlaying;
  else if (audioProgress > 0 && audioProgress < 100) audioLabel = dict.audioPaused;

  const sections = data?.recit ? splitRecit(data.recit) : [];
  const archetypeName = data?.nom_totem ?? "";
  const orderInfo =
    data?.numero_serie && data.created_at
      ? formatInterface(ui.artwork.orderInfo, { number: data.numero_serie, date: formatDate(data.created_at, lang) })
      : "";

  if (fetchStatus === "notfound" || fetchStatus === "error" || fetchStatus === "delayed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-nuit px-6 text-center">
        <Logo size={40} />
        <p className="text-lg text-ivoire" role={fetchStatus === "delayed" ? "status" : "alert"}>
          {fetchStatus === "delayed" ? (lang === "fr" ? "Le traitement prend plus de temps que prévu. Vous pouvez vérifier à nouveau dans un instant." : "Processing is taking longer than expected. You can check again shortly.") : delayNotice ?? (fetchStatus === "notfound" ? ui.errors.artworkMissing : ui.errors.artworkLoadFailed)}
        </p>
        {fetchStatus !== "notfound" && <button type="button" className="text-sm text-or underline underline-offset-4" onClick={() => { setFetchStatus("loading"); setDelayNotice(null); setRevision(n => n + 1); }}>{lang === "fr" ? "Vérifier à nouveau" : "Check again"}</button>}
        <Link href={`/${lang}/espace`} className="text-sm text-or underline">
          {dict.backToSpace}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-nuit">
      {/* motif tournant en arrière-plan */}
      <svg
        className="pointer-events-none absolute left-1/2 top-24 z-0 h-[900px] w-[900px] -translate-x-1/2 animate-[spin-slow_130s_linear_infinite] opacity-[0.22]"
        viewBox="0 0 760 760"
      >
        <g stroke="#C9A84C" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.10" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.10" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.10" />
        </g>
      </svg>

      {/* barre du haut */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-9 lg:px-16">
        <Brand lang={lang} />
        <Link href={`/${lang}/espace`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.backToSpace}
        </Link>
      </div>

      {/* révélation */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-14 pt-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>

        {orderInfo && <p className="mt-4 text-xs text-grisclair">{orderInfo}</p>}
      </div>

      {/* le parchemin */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-2 pb-24 sm:px-6">
        <div className="relative flex min-h-85 w-full max-w-3xl items-center justify-center">

          {/* message de chargement */}
          {phase === "loading" && <div
            className="absolute inset-0 flex items-center justify-center px-8 text-center transition-opacity duration-500"
            style={{ opacity: phase === "loading" ? 1 : 0, pointerEvents: "none" }}
          >
            <p role="status" className="font-display animate-[instr-pulse_2.4s_ease-in-out_infinite] text-xl italic text-orpale">
              {fetchStatus === "pending" ? dict.loadingText : dict.loadingText}
            </p>
          </div>}

          {/* rouleau */}
          {fetchStatus === "ready" && (
            <div
              inert={phase === "loading"}
              aria-hidden={phase === "loading"}
              className="flex w-full flex-col items-center transition-opacity duration-[600ms]"
              style={{ opacity: phase === "loading" ? 0 : 1 }}
            >
              <div
                className="relative flex w-full flex-col items-center motion-reduce:animate-none!"
                style={{
                  cursor: phase === "closed" ? "pointer" : "default",
                  animation: phase === "closed" ? "scroll-float 5s ease-in-out infinite" : "none",
                }}
              >
                {!isOpen && <button type="button" onClick={openScroll} aria-label={dict.openPrompt} aria-expanded={false} aria-controls="artwork-story" className="absolute inset-0 z-10 w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or" />}
                <div aria-hidden="true" className="royal-scroll-cap royal-scroll-top" />

                {/* feuille de parchemin */}
                <div
                  className="royal-scroll-paper grid w-full transition-[grid-template-rows] duration-[1150ms] motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                  <div
                    id="artwork-story"
                    ref={scrollRef}
                    role="region"
                    aria-label={dict.parcheminTitle}
                    tabIndex={-1}
                    inert={!isOpen}
                    aria-hidden={!isOpen}
                    className="royal-scroll-content [overflow-wrap:anywhere] transition-opacity duration-700 focus-visible:outline-2 focus-visible:outline-or motion-reduce:transition-none motion-reduce:delay-0!"
                    style={{ opacity: isOpen ? 1 : 0, transitionDelay: isOpen ? "450ms" : "0ms" }}
                  >
                    <header className="mb-10 text-center">
                      <p className="font-display text-3xl font-bold sm:text-5xl">TOTEM ANCESTRAL</p>
                      <p className="mt-2 font-display text-lg italic">{lang === "fr" ? "Décret royal de révélation symbolique" : "Royal decree of symbolic revelation"}</p>
                      {data?.image_url && <div className="mx-auto my-6 w-3/4 max-w-sm border-4 border-[#b18a2d] p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element -- portrait personnel généré */}
                        <img src={data.image_url} alt={formatInterface(ui.artwork.portrait, { name: archetypeName })} className="h-auto w-full" />
                      </div>}
                      {archetypeName && <h1 className="font-display text-2xl font-bold uppercase sm:text-4xl">{archetypeName}</h1>}
                    </header>
                    <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "#8B6F2E" }}>
                      {dict.parcheminTitle}
                    </p>

                    {sections.map((section, i) => (
                      <div key={i} className={i < sections.length - 1 ? "mb-6" : ""}>
                        {section.title && (
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B6F2E" }}>
                            {section.title}
                          </p>
                        )}
                        <p className="royal-scroll-text">
                          {section.text}
                        </p>
                      </div>
                    ))}

                    <div className="mt-8 flex justify-center">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-[#c29236] bg-[#ad140d] shadow-[2px_3px_0_#790e09]" style={{ borderColor: "#8B6F2E" }}>
                        <span className="font-display text-lg tracking-wide" style={{ color: "#EDD99A" }}>TA</span>
                      </div>
                    </div>
                  </div>
                </div>

                  </div>
                {/* embout bas */}
                <div aria-hidden="true" className="royal-scroll-cap royal-scroll-bottom" />
              </div>

              <p
                aria-hidden={isOpen}
                className="font-display mt-5.5 text-center text-lg italic text-grisclair transition-opacity duration-400"
                style={{ opacity: phase === "closed" ? 1 : 0 }}
              >
                {dict.openPrompt}
              </p>
            </div>
          )}
        </div>

        {/* la voix + boutons : visibles une fois le parchemin ouvert */}
        {fetchStatus === "ready" && data && (
          <div
            inert={!isOpen}
            aria-hidden={!isOpen}
            className="mt-9 w-full max-w-xl transition-opacity duration-[600ms]"
            style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
          >
            {data.audio_url && (
              <div className="border border-ombre bg-indigo p-8">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-or">{dict.voiceLabel}</p>
                <audio
                  ref={audioRef}
                  src={data.audio_url}
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
                />
                <div className="flex flex-wrap items-center gap-4">
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
                  <span className="text-xs text-grisclair">{audioLabel}</span>
                  <AudioSeekBar audioRef={audioRef} lang={lang} />
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              {data.pdf_url && (
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors duration-300 hover:border-or hover:text-or"
                >
                  {dict.downloadMapButton}
                </a>
              )}
              {data.certificate_url && (
                <a
                  href={data.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors duration-300 hover:border-or hover:text-or"
                >
                  {dict.downloadCertButton}
                </a>
              )}
              <button type="button"
                onClick={share}
                className="border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors duration-300 hover:border-or hover:text-or"
              >
                {shareNotice ? dict.shareCopied : dict.shareButton}
              </button>
              <p role="status" className="sr-only">{shareNotice ? dict.shareCopied : ""}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
