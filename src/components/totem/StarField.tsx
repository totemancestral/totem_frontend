"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const STARS = 46;

type Star = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
};

function generateStars(): Star[] {
  return Array.from({ length: STARS }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1.5 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    driftX: (Math.random() - 0.5) * 20,
    driftY: (Math.random() - 0.5) * 20,
  }));
}

export function StarField() {
  const reduce = useReducedMotion();
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars());
  }, []);

  if (reduce) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, var(--indigo-ancestral) 0%, var(--nuit-profonde) 100%)",
      }}
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: "var(--or-ancestral)",
            opacity: 0.25 + (star.id % 5) * 0.1,
            boxShadow: `0 0 ${star.size * 2}px color-mix(in srgb, var(--or-ancestral) 15%, transparent)`,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0.4, 1.2, 0.4],
            x: [0, star.driftX, 0],
            y: [0, star.driftY, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
