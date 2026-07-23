"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, FileText, Download, Sparkles, Share2, Users } from "lucide-react";

type Step = "black" | "image" | "name" | "revealed";

type OeuvreData = {
  image_url: string;
  nom_totem: string;
  recit?: string;
  audio_url?: string;
  pdf_url?: string;
  numero_serie?: string;
  onShare?: () => void;
  onClan?: () => void;
};

export function RevelationOeuvre({ oeuvre, locale }: { oeuvre: OeuvreData; locale: string }) {
  const [step, setStep] = useState<Step>("black");
  const [nameChars, setNameChars] = useState("");
  const [audioRef] = useState(() =>
    typeof Audio !== "undefined" ? new Audio("/assets/totem-music.mp3") : null,
  );

  useEffect(() => {
    const t1 = setTimeout(() => {
      audioRef?.play().catch(() => {});
      setStep("image");
    }, 4000);

    const t2 = setTimeout(() => setStep("name"), 7000);

    const name = oeuvre.nom_totem || "";
    const t3 = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= name.length) {
          setNameChars(name.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep("revealed"), 500);
        }
      }, 60);
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [audioRef, oeuvre.nom_totem]);

  const isFr = locale === "fr";

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "var(--nuit-profonde)" }}>
      <AnimatePresence mode="wait">
        {step === "black" && (
          <motion.div
            key="black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--nuit-profonde)" }}
          >
            <div className="text-center">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                     background: "var(--or-ancestral)",
                     opacity: 0.3 + Math.random() * 0.7,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                  }}
                />
              ))}
              <motion.p
                className="text-sm uppercase tracking-[0.3em]"
                style={{ color: "var(--or-ancestral)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isFr ? "Le griot compose..." : "The griot composes..."}
              </motion.p>
            </div>
          </motion.div>
        )}

        {step === "image" && (
          <motion.div
            key="image"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={oeuvre.image_url}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "saturate(0.82) contrast(1.04)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 40%, var(--nuit-profonde) 92%)",
              }}
            />
          </motion.div>
        )}

        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {oeuvre.image_url && (
              <img
                src={oeuvre.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "saturate(0.82) contrast(1.04) brightness(0.45)" }}
              />
            )}
            <div className="absolute inset-0" style={{ background: "rgba(13,13,26,0.7)" }} />
            <div className="relative z-10 px-6 text-center">
              <motion.h1
                className="text-[clamp(28px,5vw,72px)] uppercase leading-none tracking-wide"
                style={{ color: "var(--or-ancestral)", fontFamily: "var(--font-display)" }}
              >
                {nameChars}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: "var(--or-ancestral)" }}
                >
                  |
                </motion.span>
              </motion.h1>
            </div>
          </motion.div>
        )}

        {step === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex min-h-screen flex-col items-center justify-center gap-8 px-5 py-24"
          >
            <div className="relative w-full max-w-md">
              {oeuvre.image_url && (
                <motion.img
                  src={oeuvre.image_url}
                  alt={oeuvre.nom_totem}
                  initial={{ scale: 0.92, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="w-full rounded object-cover shadow-2xl"
                  style={{ aspectRatio: "4/5", filter: "saturate(0.82) contrast(1.04)" }}
                />
              )}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center"
            >
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: "var(--or-ancestral)" }}
              >
                {oeuvre.numero_serie ? `#${oeuvre.numero_serie}` : ""}
              </p>
              <h1
                className="mt-2 text-[clamp(24px,4vw,52px)] uppercase leading-none"
                style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
              >
                {oeuvre.nom_totem}
              </h1>
            </motion.div>

            {oeuvre.recit && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="premium-panel max-h-80 w-full max-w-2xl overflow-y-auto p-6 text-sm leading-relaxed whitespace-pre-line"
                style={{
                  background: "rgba(13,13,26,0.8)",
                  borderColor: "rgba(216,173,77,0.18)",
                  color: "var(--or-pale)",
                }}
              >
                {oeuvre.recit}
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {oeuvre.audio_url && (
                <a
                  href={oeuvre.audio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <Volume2 size={16} />
                  {isFr ? "Voix de l'ancêtre" : "Ancestor's voice"}
                </a>
              )}
              {oeuvre.pdf_url && (
                <a href={oeuvre.pdf_url} target="_blank" rel="noreferrer" className="btn-secondary">
                  <FileText size={16} />
                  PDF
                </a>
              )}
              {oeuvre.onShare && (
                <button type="button" onClick={oeuvre.onShare} className="btn-secondary">
                  <Share2 size={16} />
                  {isFr ? "Partager" : "Share"}
                </button>
              )}
              {oeuvre.onClan && (
                <button type="button" onClick={oeuvre.onClan} className="btn-secondary">
                  <Users size={16} />
                  {isFr ? "Mon Clan" : "My Clan"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
