"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

export type QuestionAudioLabels = {
  listen: string;
  playing: string;
  replay: string;
  hint: string;
};

/** Met la nappe musicale en veille pendant la voix, puis la relance. */
function duckAmbient() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("totem:ambient-duck"));
}
function unduckAmbient() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("totem:ambient-unduck"));
}

/**
 * Lecteur audio d'une question (parcours Junior & Adulte).
 *
 * Se (re)charge et se déclenche automatiquement à chaque changement de
 * question, après le geste utilisateur initial (« Commencer » / « Suivant ») —
 * condition exigée par les navigateurs pour l'autoplay avec son. Le bouton
 * play/pause sert aussi de secours si l'autoplay est bloqué. Pendant la
 * lecture, la nappe musicale du site est mise en veille.
 */
export function QuestionAudio({
  src,
  fallbackSrc,
  labels,
  size = "lg",
}: {
  src: string;
  /** Piste de secours si `src` est introuvable (ex. voix EN pas encore deposee). */
  fallbackSrc?: string;
  labels: QuestionAudioLabels;
  /** `lg` = grand cercle (Junior), `sm` = compact (Adulte, layout fixe). */
  size?: "lg" | "sm";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Une nouvelle question repart toujours de la piste demandee.
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  // (Re)charge la nouvelle question et tente l'autoplay. L'élément <audio>
  // est persistant (pas de remount via `key`) pour conserver le
  // « déverrouillage » audio obtenu au premier geste utilisateur.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setPlayed(false);
    setPlaying(false);
    try {
      el.load();
    } catch {
      /* noop */
    }
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    return () => {
      try {
        el.pause();
      } catch {
        /* noop */
      }
      unduckAmbient();
    };
  }, [currentSrc]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (el.ended) el.currentTime = 0;
      const promise = el.play();
      if (promise && typeof promise.then === "function") {
        promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        setPlaying(true);
      }
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const label = playing ? labels.playing : played ? labels.replay : labels.listen;
  const dim = size === "lg" ? 64 : 46;
  const icon = size === "lg" ? 24 : 18;

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={currentSrc}
        preload="auto"
        onPlay={() => {
          setPlaying(true);
          duckAmbient();
        }}
        onPause={() => {
          setPlaying(false);
          unduckAmbient();
        }}
        onError={() => {
          // Piste absente (ex. voix EN non encore deposee) : on bascule sur le
          // repli plutot que de laisser un lecteur muet.
          if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        }}
        onEnded={() => {
          setPlaying(false);
          setPlayed(true);
          unduckAmbient();
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="relative flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          height: dim,
          width: dim,
          background: "var(--or-ancestral)",
          color: "var(--nuit-profonde)",
          boxShadow: playing
            ? "0 0 0 6px rgba(216,173,77,0.16), 0 0 40px -6px rgba(216,173,77,0.75)"
            : "0 10px 28px -12px rgba(216,173,77,0.65)",
        }}
      >
        {playing ? <Pause size={icon} /> : <Play size={icon} style={{ marginLeft: 3 }} />}
        {playing && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: "1px solid rgba(216,173,77,0.5)" }}
          />
        )}
      </button>
      <div className="flex flex-col gap-1.5">
        <span
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wide"
          style={{ color: "var(--or-pale)" }}
        >
          <Volume2 size={15} />
          {label}
        </span>
        {playing ? (
          <AudioWave />
        ) : (
          <span
            className="max-w-[220px] text-xs leading-snug"
            style={{ color: "rgba(245,240,232,0.5)" }}
          >
            {labels.hint}
          </span>
        )}
      </div>
    </div>
  );
}

function AudioWave() {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((bar) => (
        <span key={bar} className="audio-bar" style={{ animationDelay: `${bar * 0.12}s` }} />
      ))}
    </span>
  );
}
