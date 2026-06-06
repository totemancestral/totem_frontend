"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

const TOUR_SESSION_KEY = "totem_site_tour_seen";

type TourStep = {
  title: string;
  text: string;
};

function hasSeenTour() {
  try {
    return sessionStorage.getItem(TOUR_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberTourSeen() {
  try {
    sessionStorage.setItem(TOUR_SESSION_KEY, "true");
  } catch {
    /* session storage can be unavailable in restricted browser contexts */
  }
}

export function SiteTourModal({ active }: { active: boolean }) {
  const t = useTranslations("siteTour");
  const steps = t.raw("steps") as TourStep[];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || hasSeenTour()) return;
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [active]);

  const close = () => {
    rememberTourSeen();
    setOpen(false);
  };

  const current = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(13,13,26,0.78)", backdropFilter: "blur(16px)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-tour-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full max-w-[520px] rounded-lg border px-5 py-6 text-center md:px-8 md:py-8"
            style={{
              background: "linear-gradient(180deg, rgba(26,26,46,0.98), rgba(13,13,26,0.98))",
              borderColor: "rgba(201,168,76,0.38)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label={t("close")}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              style={{ borderColor: "rgba(201,168,76,0.24)", color: "var(--or-pale)" }}
            >
              <X size={16} />
            </button>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-or/30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="h-14 w-14 rounded-full"
                style={{
                  border: "1px solid rgba(201,168,76,0.22)",
                  borderTopColor: "var(--or-ancestral)",
                  borderRightColor: "var(--or-pale)",
                }}
              />
            </div>

            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              {t("eyebrow", { current: index + 1, total: steps.length })}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="mt-4 min-h-[150px]"
              >
                <h2
                  id="site-tour-title"
                  className="h-display text-[28px] leading-tight md:text-[40px]"
                  style={{ color: "var(--ivoire)" }}
                >
                  {current.title}
                </h2>
                <p
                  className="body-copy mx-auto mt-5 max-w-[430px]"
                  style={{ color: "rgba(254,252,240,0.76)" }}
                >
                  {current.text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                disabled={index === 0}
                className="btn-secondary !px-4 !py-3 !text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                {t("previous")}
              </button>
              <button
                type="button"
                onClick={
                  isLast ? close : () => setIndex((value) => Math.min(steps.length - 1, value + 1))
                }
                className="btn-primary !px-5 !py-3 !text-[11px]"
              >
                {isLast ? t("finish") : t("next")}
                {!isLast && <ArrowRight size={14} />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
