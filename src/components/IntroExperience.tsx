import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

const introVideoWebm = "/assets/totem-intro.webm";
const totemLogo = "/assets/totem-logo.png";

type Phase = "ready" | "loading" | "welcome" | "done";

export function IntroExperience({ onFinished }: { onFinished: () => void }) {
  const t = useTranslations("intro");
  const brand = useTranslations("brand");
  const [phase, setPhase] = useState<Phase>("ready");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, []);

  const startVideo = () => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = false;
    v.volume = 1;
    v.currentTime = 0;
    setPhase("loading");

    v.play().catch(() => {
      setPhase("welcome");
    });
  };

  const goToWelcome = () => setPhase("welcome");

  const enter = () => {
    window.dispatchEvent(new Event("totem:ambient-start"));
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
          style={{ background: "var(--nuit-profonde)", height: "100svh" }}
        >
          {/* Loading video — autoplays muted, then reveals the welcome screen */}
          <video
            ref={videoRef}
            playsInline
            preload="metadata"
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
          >
            <source src={introVideoWebm} type="video/webm" />
          </video>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, var(--nuit-profonde) 100%)",
            }}
          />

          {/* Skip the loading video */}
          {(phase === "ready" || phase === "loading") && (
            <button
              onClick={goToWelcome}
              className="absolute right-5 top-[calc(1.25rem+env(safe-area-inset-top))] z-20 text-[11px] tracking-[0.18em] uppercase opacity-70 transition-opacity hover:opacity-100 md:right-6 md:top-[calc(1.5rem+env(safe-area-inset-top))]"
              style={{ color: "var(--or-ancestral)" }}
            >
              Passer →
            </button>
          )}

          <AnimatePresence>
            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex h-full w-full max-w-[560px] flex-col items-center justify-center gap-7 px-6 text-center"
              >
                <motion.img
                  src={totemLogo}
                  alt={brand("name")}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="h-auto w-[170px] drop-shadow-[0_10px_40px_rgba(201,168,76,0.25)] md:w-[210px]"
                />

                <motion.button
                  onClick={startVideo}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.25 }}
                  className="btn-primary animate-pulse-blink"
                  aria-label={t("startAria")}
                >
                  {t("start")}
                </motion.button>
              </motion.div>
            )}

            {phase === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="relative z-10 flex h-full w-full max-w-[640px] flex-col items-center justify-center gap-8 px-6 text-center"
              >
                <motion.img
                  src={totemLogo}
                  alt={brand("name")}
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
                  {t("welcomePrefix")}
                  <br />
                  {brand("name")}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.9 }}
                  className="flex flex-col gap-3"
                  style={{ color: "var(--ivoire)" }}
                >
                  <p className="quote-italic text-lg md:text-xl">{t("line1")}</p>
                  <p className="quote-italic text-lg md:text-xl">{t("line2")}</p>
                  <p className="quote-italic text-lg md:text-xl">{t("line3")}</p>
                </motion.div>

                <motion.button
                  onClick={enter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.4 }}
                  className="btn-primary mt-4 animate-pulse-blink"
                  aria-label={t("enterAria")}
                >
                  {t("enter")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
