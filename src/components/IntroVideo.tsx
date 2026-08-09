"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";

const INTRO_SESSION_KEY = "totem_intro_seen";
const INTRO_SRC = "/assets/intro/totem-intro.mp4";

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    /* sessionStorage peut être indisponible (navigation privée verrouillée) */
  }
}

/**
 * Vidéo d'accueil jouée avant d'entrer sur le site, une fois par session.
 *
 * Les navigateurs n'autorisent l'autoplay qu'en sourdine : la vidéo démarre
 * donc muette, avec un bouton pour rétablir le son. Le spectateur peut passer
 * l'intro à tout moment, et la fin de la vidéo referme le voile
 * automatiquement.
 */
export function IntroVideo({
  onDone,
  active = true,
}: {
  /** Appelé quand l'intro se termine ou est passée (une seule fois). */
  onDone?: () => void;
  active?: boolean;
}) {
  const t = useTranslations("intro");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    rememberIntroSeen();
    setOpen(false);
    onDone?.();
  };

  useEffect(() => {
    if (!active) return;
    if (hasSeenIntro()) {
      doneRef.current = true;
      onDone?.();
      return;
    }
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Le voile bloque le défilement tant que l'intro est affichée.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Échap passe l'intro.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    const next = !muted;
    el.muted = next;
    setMuted(next);
    if (!next) {
      // Rétablir le son compte comme un geste utilisateur : la lecture peut
      // avoir été mise en pause par la politique d'autoplay.
      const promise = el.play();
      if (promise && typeof promise.then === "function") promise.catch(() => undefined);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: "var(--nuit-profonde)" }}
          role="dialog"
          aria-modal="true"
          aria-label={t("label")}
        >
          <video
            ref={videoRef}
            src={INTRO_SRC}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setReady(true)}
            onEnded={finish}
            // Vidéo illisible (format refusé, fichier absent) : on n'enferme
            // jamais le visiteur devant un écran noir.
            onError={finish}
          />

          {/* Voile dégradé : garde les commandes lisibles sur une image claire. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,13,26,0.55) 0%, transparent 28%, transparent 62%, rgba(13,13,26,0.75) 100%)",
            }}
          />

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-8 md:pb-12">
            <button
              type="button"
              onClick={finish}
              className="btn-primary !px-9 !py-4"
              style={{ opacity: ready ? 1 : 0.75 }}
            >
              {t("enter")}
            </button>
            <button
              type="button"
              onClick={finish}
              className="caption uppercase transition-colors"
              style={{ color: "color-mix(in srgb, var(--ivoire) 58%, transparent)" }}
            >
              {t("skip")}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? t("unmute") : t("mute")}
            title={muted ? t("unmute") : t("mute")}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:bg-ombre md:right-6 md:top-6"
            style={{
              borderColor: "rgba(216,173,77,0.32)",
              color: "var(--or-ancestral)",
              background: "rgba(13,13,26,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
