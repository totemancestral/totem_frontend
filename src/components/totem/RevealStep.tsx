"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, LayoutDashboard, Loader2 } from "lucide-react";
import type { StorySection } from "@/lib/totem-v3";
import { mysticAudio } from "@/lib/mysticAudio";
import { GoldButton } from "./GoldButton";
import { Seal } from "./Seal";

type Phase = "closed" | "spin" | "settle" | "opening" | "content";

interface RevealData {
  userName: string;
  totemName: string;
  totemImage: string;
  subtitle: string;
  sections: StorySection[];
  numeroSerie?: string;
  audioUrl?: string;
  pdfUrl?: string;
}

interface RevealStepProps {
  data: RevealData;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onShare?: () => void;
  onClan?: () => void;
}

async function downloadParchmentPdf(container: HTMLElement, fileName: string) {
  const html2canvas = (await import("html2canvas")).default;
  const { default: jsPDF } = await import("jspdf");

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((r) => setTimeout(r, 150));

  const pages = Array.from(container.querySelectorAll<HTMLElement>(".pdf-page")).slice(0, 3);

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0a0a0e",
      logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
  }

  pdf.save(fileName);
}

export function RevealStep({ data, pdfRef, onBack, onShare, onClan }: RevealStepProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "content" : "closed");
  const [downloading, setDownloading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reduce) {
      mysticAudio.chime();
      return;
    }
    const push = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

    push(() => setPhase("spin"), 1100);
    push(() => setPhase("settle"), 2700);
    push(() => {
      setPhase("opening");
      mysticAudio.swell();
    }, 3400);
    push(() => {
      setPhase("content");
      mysticAudio.chime();
    }, 4700);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reduce]);

  const showClosed = phase === "closed" || phase === "spin" || phase === "settle";
  const showOpen = phase === "opening" || phase === "content";
  const showContent = phase === "content";

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    try {
      setDownloading(true);
      const safe = data.userName.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
      await downloadParchmentPdf(pdfRef.current, `Totem-Ancestral-${safe}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--nuit-profonde)" }}
    >
      {/* Flash lumineux a l'ouverture */}
      <AnimatePresence>
        {phase === "opening" && !reduce && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-20"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(232,193,90,0.65), transparent 60%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* ROULEAU FERME */}
      <AnimatePresence>
        {showClosed && (
          <motion.div
            key="scroll-closed"
            className="relative"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: phase === "settle" ? [1.02, 1] : 1,
              y: phase === "settle" ? [0, -4, 0] : [0, -12, 0],
              rotateY: phase === "spin" ? 360 : 0,
            }}
            exit={{ opacity: 0, scaleY: 0.04, scaleX: 1.2 }}
            transition={{
              opacity: { duration: 0.9, ease: "easeOut" },
              scale:
                phase === "settle"
                  ? { type: "spring", stiffness: 260, damping: 14 }
                  : { duration: 0.9, ease: "easeOut" },
              rotateY: { duration: 1.5, ease: "easeInOut" },
              y:
                phase === "spin"
                  ? { duration: 1.5, ease: "easeInOut" }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.img
              src="/assets/totem/roule.png"
              alt="Parchemin ferme"
              width={230}
              className="h-auto w-[190px] sm:w-[230px]"
              animate={{
                filter:
                  phase === "spin"
                    ? [
                        "drop-shadow(0 0 8px rgba(212,169,74,0.3))",
                        "drop-shadow(0 0 40px rgba(232,193,90,0.9))",
                      ]
                    : "drop-shadow(0 0 14px rgba(212,169,74,0.4))",
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PARCHEMIN OUVERT + CONTENU */}
      {showOpen && (
        <motion.div
          key="scroll-open"
          className="w-full origin-center"
          style={{
            width: "min(92vw, 794px)",
            maxWidth: "100%",
            transformOrigin: "center",
          }}
          initial={
            reduce ? { opacity: 1, scaleX: 1, scaleY: 1 } : { scaleX: 0.29, scaleY: 0, opacity: 0 }
          }
          animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
          transition={{
            opacity: { duration: reduce ? 0 : 0.35, ease: "easeOut" },
            scaleX: { duration: reduce ? 0 : 0.85, ease: "easeOut" },
            scaleY: {
              duration: reduce ? 0 : 1.15,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        >
          <div
            className="relative w-full px-[13%] pb-[13%] pt-[16%]"
            style={{
              backgroundImage: "url(/assets/totem/parchemin_ouvert.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <motion.div
              className="flex flex-col items-center text-center"
              style={{ color: "#2c1d0c" }}
              initial="hidden"
              animate={showContent ? "show" : "hidden"}
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.3,
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              <Block>
                <h2
                  className="font-serif text-2xl font-bold uppercase tracking-[0.14em] sm:text-3xl"
                  style={{ color: "#2c1d0c" }}
                >
                  Totem Ancestral
                </h2>
                <p className="mt-1 font-serif text-sm italic" style={{ color: "#5a4526" }}>
                  {data.subtitle}
                </p>
              </Block>

              <Block>
                <img
                  src={data.totemImage}
                  alt={data.totemName}
                  className="mx-auto my-3 w-40 sm:w-52"
                  style={{
                    filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.3))",
                  }}
                />
              </Block>

              {data.numeroSerie && (
                <Block>
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#5a4526" }}>
                    #{data.numeroSerie}
                  </p>
                </Block>
              )}

              <Block>
                <h3
                  className="font-serif text-lg font-bold uppercase tracking-[0.1em] sm:text-xl"
                  style={{ color: "#2c1d0c" }}
                >
                  {data.totemName}
                </h3>
                <p className="mt-1 font-hand text-2xl" style={{ color: "#2c1d0c" }}>
                  Prepare pour {data.userName}
                </p>
              </Block>

              <div
                className="my-4 h-[2px] w-28"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--ombre-doree), transparent)",
                }}
              />

              {data.sections.map((s, si) => (
                <Block key={s.title} delay={0.5 + si * 0.1}>
                  {s.title && (
                    <h4 className="font-serif text-base font-bold" style={{ color: "#5a4526" }}>
                      {s.title}
                    </h4>
                  )}
                  {s.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="mt-1 font-hand text-xl leading-snug sm:text-2xl"
                      style={{ color: "#2c1d0c" }}
                    >
                      {p}
                    </p>
                  ))}
                </Block>
              ))}

              <Block>
                <div className="mt-5 flex justify-center">
                  <Seal size={72} />
                </div>
              </Block>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* BOUTONS */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.4, duration: 0.6 }}
          >
            <GoldButton onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading ? "Generation..." : "Telecharger le PDF"}
            </GoldButton>

            {data.pdfUrl && (
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button-outline inline-flex items-center gap-2 rounded-sm px-6 py-3 text-xs uppercase tracking-[.18em] transition-all"
                style={{
                  border: "1px solid rgba(216,173,77,0.5)",
                  color: "var(--or-ancestral)",
                  textDecoration: "none",
                }}
              >
                <Download className="h-4 w-4" />
                PDF Haute Definition
              </a>
            )}

            {onShare && (
              <GoldButton variant="outline" onClick={onShare}>
                Partager
              </GoldButton>
            )}

            {onClan && (
              <GoldButton variant="outline" onClick={onClan}>
                Mon Clan
              </GoldButton>
            )}

            <GoldButton variant="outline" onClick={onBack}>
              <LayoutDashboard className="h-4 w-4" />
              Retour
            </GoldButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Block({ children, delay }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      className="w-full"
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
