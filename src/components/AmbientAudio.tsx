import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import music from "@/assets/totem-music.mp3";

/**
 * Ambient background music that starts after the intro finishes.
 * Stops automatically when the user clicks any CTA button (.btn-primary / .btn-secondary)
 * or any <button>/<a> with [data-stop-ambient]. Also offers a discreet mute toggle.
 */
export function AmbientAudio({ active }: { active: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stopped, setStopped] = useState(false);
  const [muted, setMuted] = useState(false);

  // Start when active becomes true
  useEffect(() => {
    if (!active || stopped) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => {
        // fade in
        const start = performance.now();
        const fade = (t: number) => {
          const k = Math.min(1, Math.max(0, (t - start) / 1800));
          a.volume = Math.min(1, Math.max(0, 0.55 * k));
          if (k < 1 && !a.paused) requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
      })
      .catch(() => {
        // If autoplay still blocked, stop silently
        setStopped(true);
      });
  }, [active, stopped]);

  // Listen for CTA clicks anywhere on the page
  useEffect(() => {
    if (!active || stopped) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        ".btn-primary, .btn-secondary, [data-stop-ambient]"
      );
      if (el) fadeOutAndStop();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, stopped]);

  const fadeOutAndStop = () => {
    const a = audioRef.current;
    if (!a) {
      setStopped(true);
      return;
    }
    const startVol = a.volume;
    const start = performance.now();
    const fade = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / 900));
      a.volume = Math.min(1, Math.max(0, startVol * (1 - k)));
      if (k < 1) requestAnimationFrame(fade);
      else {
        a.pause();
        setStopped(true);
      }
    };
    requestAnimationFrame(fade);
  };

  if (stopped) return null;

  return (
    <>
      <audio ref={audioRef} src={music} loop preload="auto" />
      {active && (
        <button
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            const next = !muted;
            setMuted(next);
            a.muted = next;
          }}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          className="fixed bottom-6 right-6 z-[90] flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-all hover:scale-105"
          style={{
            borderColor: "rgba(212,175,55,0.4)",
            background: "rgba(11,11,15,0.55)",
            color: "var(--or-ancestral)",
          }}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
    </>
  );
}
