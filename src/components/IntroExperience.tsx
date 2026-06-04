import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import introVideo from "@/assets/totem-intro.mp4";
import totemLogo from "@/assets/totem-logo.png";

type Phase = "loading" | "welcome" | "done";

export function IntroExperience({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay the video with sound. If blocked by browser policy, fallback to muted.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      // If unmuted autoplay is blocked, try muted
      v.muted = true;
      v.play().catch(() => {
        setPhase("welcome");
      });
    });
  }, []);

  const goToWelcome = () => setPhase("welcome");

  const enter = () => {
    setPhase("done");
    setTimeout(onFinished, 900);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onErr = () => setPhase("welcome");
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
          {/* Loading video — autoplays muted, then reveals the welcome screen */}
          <video
            ref={videoRef}
            src={introVideo}
            playsInline
            preload="auto"
            onEnded={goToWelcome}
            controls={false}
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{
              background: "var(--nuit-profonde)",
              opacity: phase === "loading" ? 1 : 0,
              transition: "opacity 900ms ease",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, var(--nuit-profonde) 100%)",
            }}
          />

          {/* Skip the loading video */}
          {phase === "loading" && (
            <button
              onClick={goToWelcome}
              className="absolute bottom-6 right-6 z-20 text-[11px] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "var(--or-ancestral)" }}
            >
              Passer →
            </button>
          )}

          <AnimatePresence>
            {phase === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="relative z-10 max-w-[640px] w-full px-6 flex flex-col items-center gap-8 text-center"
              >
                <motion.img
                  src={totemLogo}
                  alt="Totem Ancestral"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="w-[180px] md:w-[220px] h-auto drop-shadow-[0_10px_40px_rgba(201,168,76,0.25)]"
                />

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="h-display text-3xl md:text-5xl"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  Bienvenu sur
                  <br />
                  TOTEM ANCESTRAL
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.9 }}
                  className="flex flex-col gap-3"
                  style={{ color: "var(--ivoire)" }}
                >
                  <p className="quote-italic text-lg md:text-xl">
                    Apprêtez-vous à entrer dans une expérience sacrée.
                  </p>
                  <p className="quote-italic text-lg md:text-xl">
                    L'ancêtre vous parlera.
                  </p>
                  <p className="quote-italic text-lg md:text-xl">
                    Écoutez sa voix et laissez-le vous conduire.
                  </p>
                </motion.div>

                <motion.button
                  onClick={enter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.4 }}
                  className="btn-primary mt-4 animate-pulse-glow"
                  style={{ animation: "pulseBlink 1.4s ease-in-out infinite" }}
                  aria-label="J'entre dans l'expérience ancestrale"
                >
                  J'entre dans l'expérience ancestrale
                </motion.button>

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.7 }}
                  className="caption italic mt-1"
                  style={{ color: "rgba(254,252,240,0.5)" }}
                >
                  (avec le son)
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <style>{`
            @keyframes pulseBlink {
              0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.6), 0 0 24px rgba(201,168,76,0.35); opacity: 1; }
              50% { box-shadow: 0 0 0 12px rgba(201,168,76,0), 0 0 40px rgba(201,168,76,0.55); opacity: 0.85; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
