"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { StarField } from "./StarField";

const MESSAGES = [
  "Le griot analyse tes réponses...",
  "Il consulte les esprits gardiens...",
  "Il choisit ton totem parmi les anciens...",
  "Il grave ton nom dans le parchemin...",
];

interface LoadingStepProps {
  onComplete?: () => void;
  duration?: number;
}

export function LoadingStep({ onComplete, duration = 5000 }: LoadingStepProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (MESSAGES.length <= 1) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= MESSAGES.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, duration / MESSAGES.length);

    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration + 500);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center"
      style={{ background: "#0D0D1A" }}
    >
      <StarField />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Anneau rotatif */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--or-ancestral)",
              borderRightColor: "var(--or-ancestral)",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              border: "1.5px solid transparent",
              borderBottomColor: "rgba(201,168,76,0.6)",
              borderLeftColor: "rgba(201,168,76,0.6)",
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="h-4 w-4 rounded-full" style={{ background: "var(--or-ancestral)" }} />
        </div>

        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm uppercase tracking-[0.25em]"
          style={{ color: "rgba(237,217,154,0.8)" }}
        >
          {MESSAGES[messageIndex]}
        </motion.p>

        {/* Barre de progression */}
        <div
          className="h-[2px] w-64 overflow-hidden rounded-full"
          style={{ background: "rgba(201,168,76,0.15)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--or-ancestral)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: duration / 1000, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
