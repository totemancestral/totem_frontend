"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

type Phase = "loading" | "closed" | "open";

type OeuvreData = {
  nom_totem: string | null;
  recit: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  numero_serie: string | null;
  statut: string;
  created_at: string;
};

type FetchStatus = "loading" | "pending" | "ready" | "notfound" | "error";

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

/** Découpe le récit (parchemin + pages du récit, concaténés côté backend)
 *  en paragraphes affichables ; une première ligne courte est traitée comme
 *  un titre de mouvement. */
function splitRecit(recit: string): { title: string | null; text: string }[] {
  return recit
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n");
      if (lines.length > 1 && lines[0].length <= 60) {
        return { title: lines[0], text: lines.slice(1).join(" ").trim() };
      }
      return { title: null, text: chunk };
    });
}

export default function Oeuvre({ dict, lang }: { dict: Dictionary["oeuvre"]; lang: Locale }) {
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commande");

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(commandeId ? "loading" : "notfound");
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

    async function poll() {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (alive) setFetchStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/oeuvre/${commandeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alive) return;

        if (response.status === 404) {
          setFetchStatus("notfound");
          return;
        }
        if (!response.ok) {
          setFetchStatus("error");
          return;
        }

        const payload = (await response.json()) as { oeuvre: OeuvreData | null };
        if (payload.oeuvre) {
          setData(payload.oeuvre);
          setFetchStatus("ready");
          // Le griot "termine l'écriture" un court instant avant que le
          // parchemin ne soit disponible — mise en scène plutôt que technique.
          setTimeout(() => setPhase((current) => (current === "loading" ? "closed" : current)), 1200);
        } else {
          setFetchStatus("pending");
          timer = setTimeout(poll, 4000);
        }
      } catch {
        if (alive) setFetchStatus("error");
      }
    }

    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [commandeId]);

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
  let audioLabel = dict.audioListen;
  if (audioPlaying) audioLabel = dict.audioPlaying;
  else if (audioProgress > 0 && audioProgress < 100) audioLabel = dict.audioPaused;

  const sections = data?.recit ? splitRecit(data.recit) : [];
  const archetypeName = data?.nom_totem ?? "";
  const orderInfo =
    data?.numero_serie && data.created_at
      ? `Œuvre N° ${data.numero_serie} · Livrée le ${formatDate(data.created_at, lang)}`
      : "";

  if (fetchStatus === "notfound" || fetchStatus === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-nuit px-6 text-center">
        <Logo size={40} />
        <p className="text-lg text-ivoire">
          {fetchStatus === "notfound" ? "Œuvre introuvable." : "Impossible de charger votre œuvre pour le moment."}
        </p>
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
      <div className="relative z-10 flex items-center justify-between px-6 py-9 lg:px-16">
        <Brand lang={lang} />
        <Link href={`/${lang}/espace`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.backToSpace}
        </Link>
      </div>

      {/* révélation */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-14 pt-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>

        {data?.image_url && (
          <div className="relative my-7 h-85 w-55 overflow-hidden border border-ombre">
            {/* eslint-disable-next-line @next/next/no-img-element -- image générée dynamiquement, domaine backend non préconfiguré */}
            <img src={data.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {archetypeName && (
          <>
            <p className="font-display text-xl italic text-orpale">{dict.youAreLabel}</p>
            <h1 className="font-display text-5xl text-ivoire lg:text-7xl">{archetypeName}</h1>
          </>
        )}
        {orderInfo && <p className="mt-4 text-xs text-grisclair">{orderInfo}</p>}
      </div>

      {/* le parchemin */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 pb-24">
        <div className="relative flex min-h-85 w-full max-w-xl items-center justify-center">

          {/* message de chargement */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8 text-center transition-opacity duration-500"
            style={{ opacity: phase === "loading" ? 1 : 0, pointerEvents: "none" }}
          >
            <p className="font-display animate-[instr-pulse_2.4s_ease-in-out_infinite] text-xl italic text-orpale">
              {fetchStatus === "pending" ? dict.loadingText : dict.loadingText}
            </p>
          </div>

          {/* rouleau */}
          {fetchStatus === "ready" && (
            <div
              className="flex w-full flex-col items-center transition-opacity duration-[600ms]"
              style={{ opacity: phase === "loading" ? 0 : 1 }}
            >
              <button
                onClick={openScroll}
                className="flex w-full flex-col items-center"
                style={{
                  cursor: phase === "closed" ? "pointer" : "default",
                  animation: phase === "closed" ? "scroll-float 5s ease-in-out infinite" : "none",
                }}
              >
                {/* embout haut */}
                <span className="z-[2] flex h-7 w-[84%] items-center justify-between rounded-full bg-or px-4 shadow-[0_6px_16px_rgba(0,0,0,0.4)]">
                  <span className="h-3 w-0.5 bg-nuit/35" />
                  <span className="h-3 w-0.5 bg-nuit/35" />
                </span>

                {/* feuille de parchemin */}
                <div
                  className="w-[90%] overflow-hidden bg-[#EFE4C8] shadow-[0_0_0_1px_rgba(139,111,46,0.3)] transition-[max-height] duration-[1150ms] ease-[cubic-bezier(.65,0,.35,1)]"
                  style={{ maxHeight: isOpen ? "2200px" : "14px" }}
                >
                  <div
                    className="px-6 pb-9 pt-11 transition-opacity duration-700 lg:px-10"
                    style={{ opacity: isOpen ? 1 : 0, transitionDelay: isOpen ? "450ms" : "0ms" }}
                  >
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
                        <p className="font-display text-lg italic leading-relaxed" style={{ color: "#3A2E17" }}>
                          {section.text}
                        </p>
                      </div>
                    ))}

                    <div className="mt-8 flex justify-center">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-nuit" style={{ borderColor: "#8B6F2E" }}>
                        <span className="font-display text-lg tracking-wide" style={{ color: "#EDD99A" }}>TA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* embout bas */}
                <span className="z-[2] flex h-7 w-[84%] items-center justify-between rounded-full bg-or px-4 shadow-[0_-6px_16px_rgba(0,0,0,0.4)]">
                  <span className="h-3 w-0.5 bg-nuit/35" />
                  <span className="h-3 w-0.5 bg-nuit/35" />
                </span>
              </button>

              <p
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
                <div className="flex items-center gap-4">
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
                  <div className="relative h-px flex-1 bg-ombre">
                    <div className="h-px bg-or transition-[width] duration-150 ease-linear" style={{ width: `${audioProgress}%` }} />
                  </div>
                  <span className="whitespace-nowrap text-xs text-grisclair">{audioLabel}</span>
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
              {data.pdf_url && (
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors duration-300 hover:border-or hover:text-or"
                >
                  {dict.downloadCertButton}
                </a>
              )}
              <button
                onClick={share}
                className="border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors duration-300 hover:border-or hover:text-or"
              >
                {shareNotice ? dict.shareCopied : dict.shareButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
