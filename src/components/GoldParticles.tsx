import { useEffect, useMemo, useState } from "react";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function particleValue(index: number, count: number, offset: number) {
  return seededRandom((index + 1) * 97 + count * 31 + offset * 17);
}

export function GoldParticles({ count = 26 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: particleValue(i, count, 1) * 100,
        top: particleValue(i, count, 2) * 100,
        size: 2 + particleValue(i, count, 3) * 2.5,
        delay: particleValue(i, count, 4) * 18,
        duration: 14 + particleValue(i, count, 5) * 12,
        opacity: 0.3 + particleValue(i, count, 6) * 0.4,
      })),
    [count],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {mounted &&
        particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-drift"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "var(--or-ancestral)",
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: "0 0 6px color-mix(in srgb, var(--or-ancestral) 60%, transparent)",
            }}
          />
        ))}
    </div>
  );
}
