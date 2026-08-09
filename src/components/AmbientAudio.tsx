import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const music = "/assets/totem-music.mp3";

/**
 * Ambient background music — seamless loop via two crossfading <audio> elements.
 * The next instance starts ~CROSSFADE_S before the current one ends, and both
 * are gain-faded so the "join" between loop iterations is inaudible.
 * The control remains visible when autoplay is blocked, so the user can start
 * the ambient sound manually from the fixed button.
 */
const CROSSFADE_S = 2.5;
const TARGET_VOL = 0.55;
const STORAGE_KEY = "totem_ambient_enabled";

export function AmbientAudio({ active }: { active: boolean }) {
  const aRef = useRef<HTMLAudioElement>(null);
  const bRef = useRef<HTMLAudioElement>(null);
  const currentRef = useRef<"a" | "b">("a");
  const swappedAtRef = useRef<number>(-Infinity);
  const fadeTokenRef = useRef(0);
  const enabledRef = useRef(true);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  /** Vrai si la musique jouait avant d'être mise en veille par une voix. */
  const resumeAfterDuckRef = useRef(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const fadeOutAndPause = useCallback(() => {
    const token = ++fadeTokenRef.current;
    const els = [aRef.current, bRef.current].filter(Boolean) as HTMLAudioElement[];
    if (els.length === 0) {
      setPlaying(false);
      return;
    }

    let remaining = els.length;
    els.forEach((el) =>
      fadeTo(el, 0, 900, () => {
        if (fadeTokenRef.current !== token) return;
        try {
          el.pause();
        } catch {
          /* noop */
        }
        remaining -= 1;
        if (remaining <= 0) setPlaying(false);
      }),
    );
  }, []);

  const persistEnabled = useCallback((next: boolean) => {
    enabledRef.current = next;
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    } catch {
      /* noop */
    }
  }, []);

  const startPlayback = useCallback(() => {
    if (!active || !enabledRef.current) return;
    const a = aRef.current;
    if (!a) return;
    const b = bRef.current;

    fadeTokenRef.current += 1;
    currentRef.current = "a";
    swappedAtRef.current = -Infinity;
    a.muted = false;
    a.volume = 0;
    if (b) {
      try {
        b.pause();
        b.currentTime = 0;
        b.volume = 0;
        b.muted = false;
      } catch {
        /* noop */
      }
    }

    a.play()
      .then(() => {
        setPlaying(true);
        fadeTo(a, TARGET_VOL, 1800);
      })
      .catch(() => {
        setPlaying(false);
      });
  }, [active]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "false") {
        enabledRef.current = false;
        setEnabled(false);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!active || !enabled || playing) return;

    const startOnInteraction = () => startPlayback();
    window.addEventListener("pointerdown", startOnInteraction, { once: true, passive: true });
    window.addEventListener("keydown", startOnInteraction, { once: true });
    window.addEventListener("totem:ambient-start", startOnInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      window.removeEventListener("totem:ambient-start", startOnInteraction);
    };
  }, [active, enabled, playing, startPlayback]);

  // Start when active becomes true
  useEffect(() => {
    if (!active || !enabled || playing) return;
    startPlayback();
  }, [active, enabled, playing, startPlayback]);

  // Mise en veille pendant une voix du parcours : la question doit s'entendre
  // seule, sans la nappe musicale par-dessus. La musique reprend ensuite, mais
  // seulement si elle jouait avant (on ne la démarre jamais de force).
  useEffect(() => {
    const duck = () => {
      resumeAfterDuckRef.current = playingRef.current;
      if (playingRef.current) fadeOutAndPause();
    };
    const unduck = () => {
      if (!resumeAfterDuckRef.current) return;
      resumeAfterDuckRef.current = false;
      if (enabledRef.current) startPlayback();
    };

    window.addEventListener("totem:ambient-duck", duck);
    window.addEventListener("totem:ambient-unduck", unduck);
    return () => {
      window.removeEventListener("totem:ambient-duck", duck);
      window.removeEventListener("totem:ambient-unduck", unduck);
    };
  }, [fadeOutAndPause, startPlayback]);

  useEffect(() => {
    if (active && enabled) return;
    fadeOutAndPause();
  }, [active, enabled, fadeOutAndPause]);

  // Seamless crossfade loop: poll the active element's time, when it nears the
  // end, start the other element from 0 and crossfade gains.
  useEffect(() => {
    if (!active || !enabled || !playing) return;
    let raf = 0;
    const tick = () => {
      const cur = currentRef.current === "a" ? aRef.current : bRef.current;
      const nxt = currentRef.current === "a" ? bRef.current : aRef.current;
      if (cur && nxt && cur.duration && !cur.paused) {
        const remaining = cur.duration - cur.currentTime;
        const now = performance.now();
        if (remaining <= CROSSFADE_S && now - swappedAtRef.current > 1000) {
          swappedAtRef.current = now;
          try {
            nxt.currentTime = 0;
            nxt.volume = 0;
            nxt.muted = false;
            void nxt.play();
            fadeTo(nxt, TARGET_VOL, CROSSFADE_S * 1000);
            fadeTo(cur, 0, CROSSFADE_S * 1000, () => {
              try {
                cur.pause();
              } catch {
                /* noop */
              }
            });
            currentRef.current = currentRef.current === "a" ? "b" : "a";
          } catch {
            /* noop */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, enabled, playing]);

  if (!active) return null;

  return (
    <>
      <audio ref={aRef} src={music} preload={enabled ? "auto" : "none"} />
      <audio ref={bRef} src={music} preload={enabled ? "auto" : "none"} />
      <button
        type="button"
        onClick={() => {
          if (!enabled) {
            persistEnabled(true);
            startPlayback();
            return;
          }

          if (!playing) {
            startPlayback();
            return;
          }

          persistEnabled(false);
          fadeOutAndPause();
        }}
        aria-label={!enabled ? "Activer l'audio" : playing ? "Couper l'audio" : "Lancer l'audio"}
        title={!enabled ? "Activer l'audio" : playing ? "Couper l'audio" : "Lancer l'audio"}
        className="fixed bottom-6 right-6 z-[190] flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-all hover:scale-105"
        style={{
          borderColor: "rgba(212,175,55,0.4)",
          background: "rgba(11,11,15,0.55)",
          color: enabled && playing ? "var(--or-ancestral)" : "rgba(254,252,240,0.78)",
        }}
      >
        {enabled && playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}

function fadeTo(el: HTMLAudioElement, target: number, durationMs: number, onDone?: () => void) {
  const start = performance.now();
  const startVol = el.volume;
  const step = (t: number) => {
    const k = Math.min(1, Math.max(0, (t - start) / durationMs));
    el.volume = Math.min(1, Math.max(0, startVol + (target - startVol) * k));
    if (k < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}
