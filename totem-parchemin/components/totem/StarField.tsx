import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

/** Fond sombre mystique avec particules / étoiles dorées. */
export function StarField({ count = 46 }: { count?: number }) {
  const reduce = useReducedMotion();
  // Généré côté client uniquement (Math.random) pour éviter un mismatch SSR.
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, id) => ({
        id,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 3,
        drift: (Math.random() - 0.5) * 40,
      })),
    );
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: "radial-gradient(120% 120% at 50% 0%, #12101a 0%, #0d0d12 45%, #0a0a0e 100%)",
      }}
    >
      {/* Halo doré central */}
      <div
        className="absolute left-1/2 top-1/3 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(212,169,74,0.22) 0%, transparent 70%)",
        }}
      />
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, var(--gold-light) 0%, var(--gold) 60%, transparent 100%)",
            boxShadow: "0 0 6px var(--gold)",
          }}
          animate={
            reduce
              ? { opacity: 0.5 }
              : {
                  opacity: [0.15, 0.9, 0.15],
                  y: [0, p.drift, 0],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
