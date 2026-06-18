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

export function AmbientAudio({ active }: { active: boolean }) {
  const aRef = useRef<HTMLAudioElement>(null);
  const bRef = useRef<HTMLAudioElement>(null);
  const currentRef = useRef<"a" | "b">("a");
  const swappedAtRef = useRef<number>(-Infinity);
  const [stopped, setStopped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const startPlayback = useCallback(() => {
    if (!active || stopped) return;
    const a = aRef.current;
    if (!a) return;

    currentRef.current = "a";
    swappedAtRef.current = -Infinity;
    a.muted = muted;
    a.volume = 0;

    a.play()
      .then(() => {
        setPlaying(true);
        fadeTo(a, TARGET_VOL, 1800);
      })
      .catch(() => {
        setPlaying(false);
      });
  }, [active, muted, stopped]);

  useEffect(() => {
    if (!active || stopped || playing) return;

    const startOnInteraction = () => startPlayback();
    window.addEventListener("pointerdown", startOnInteraction, { once: true, passive: true });
    window.addEventListener("keydown", startOnInteraction, { once: true });
    window.addEventListener("totem:ambient-start", startOnInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      window.removeEventListener("totem:ambient-start", startOnInteraction);
    };
  }, [active, playing, startPlayback, stopped]);

  // Start when active becomes true
  useEffect(() => {
    if (!active || stopped || playing) return;
    startPlayback();
  }, [active, playing, startPlayback, stopped]);

  // Seamless crossfade loop: poll the active element's time, when it nears the
  // end, start the other element from 0 and crossfade gains.
  useEffect(() => {
    if (!active || stopped || !playing) return;
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
            nxt.muted = muted;
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
  }, [active, playing, stopped, muted]);

  // Only explicit controls should stop the ambient sound.
  useEffect(() => {
    if (!active || stopped) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest("[data-stop-ambient]");
      if (el) fadeOutAndStop();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, stopped]);

  const fadeOutAndStop = () => {
    const els = [aRef.current, bRef.current].filter(Boolean) as HTMLAudioElement[];
    if (els.length === 0) {
      setStopped(true);
      return;
    }
    let remaining = els.length;
    els.forEach((el) =>
      fadeTo(el, 0, 900, () => {
        try {
          el.pause();
        } catch {
          /* noop */
        }
        remaining -= 1;
        if (remaining <= 0) {
          setPlaying(false);
          setStopped(true);
        }
      }),
    );
  };

  if (!active || stopped) return null;

  return (
    <>
      <audio ref={aRef} src={music} preload="auto" />
      <audio ref={bRef} src={music} preload="auto" />
      <button
        type="button"
        onClick={() => {
          if (!playing) {
            startPlayback();
            return;
          }

          const next = !muted;
          setMuted(next);
          [aRef.current, bRef.current].forEach((el) => {
            if (el) el.muted = next;
          });
        }}
        aria-label={!playing ? "Lancer l'audio" : muted ? "Activer le son" : "Couper le son"}
        title={!playing ? "Lancer l'audio" : muted ? "Activer le son" : "Couper le son"}
        className="fixed bottom-6 right-6 z-[190] flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-all hover:scale-105"
        style={{
          borderColor: "rgba(212,175,55,0.4)",
          background: "rgba(11,11,15,0.55)",
          color: "var(--or-ancestral)",
        }}
      >
        {playing && muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
