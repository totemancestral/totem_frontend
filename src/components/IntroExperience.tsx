import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import introVideo from "@/assets/totem-intro.mp4";

/**
 * Cinematic intro:
 *  1. Black "Entrer" gate (unlocks autoplay WITH sound)
 *  2. Fullscreen video, no controls, blends with --nuit-profonde
 *  3. On end → fades out, reveals the site
 */
export function IntroExperience({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState<"gate" | "playing" | "done">("gate");
  const videoRef = useRef<HTMLVideoElement>(null);

  const enter = async () => {
    setPhase("playing");
    // Try to play with sound; if the browser still refuses, fall back to muted.
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = false;
      v.volume = 1;
      await v.play();
    } catch {
      try {
        v.muted = true;
        await v.play();
      } catch {
        finish();
      }
    }
  };

  const finish = () => {
    setPhase("done");
    // small delay so the fade-out can play
    setTimeout(onFinished, 900);
  };

  // Safety: if video errors, skip
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onErr = () => finish();
    v.addEventListener("error", onErr);
    return () => v.removeEventListener("error", onErr);
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "var(--nuit-profonde)" }}
        >
          {/* Video — always mounted so it can preload */}
          <video
            ref={videoRef}
            src={introVideo}
            playsInline
            preload="auto"
            onEnded={finish}
            // Hide all native UI: no controls attr, disable PiP & download
            controls={false}
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{
              background: "var(--nuit-profonde)",
              opacity: phase === "playing" ? 1 : 0,
              transition: "opacity 700ms ease",
            }}
          />

          {/* Soft vignette so video edges melt into the site bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, var(--nuit-profonde) 100%)",
            }}
          />

          {/* Gate */}
          <AnimatePresence>
            {phase === "gate" && (
              <motion.button
                key="gate"
                onClick={enter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center gap-6 group cursor-pointer"
                aria-label="Entrer dans l'expérience"
              >
                <span
                  className="h-display text-2xl md:text-3xl tracking-[0.3em] uppercase"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  Totem Ancestral
                </span>
                <span
                  className="h-px w-24 transition-all duration-700 group-hover:w-40"
                  style={{ background: "var(--or-ancestral)" }}
                />
                <span
                  className="text-[11px] md:text-xs tracking-[0.4em] uppercase animate-pulse"
                  style={{ color: "rgba(254,252,240,0.85)" }}
                >
                  Entrer dans l'expérience
                </span>
                <span
                  className="caption italic mt-2"
                  style={{ color: "rgba(254,252,240,0.45)" }}
                >
                  (avec le son)
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
