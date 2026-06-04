import { useMemo } from "react";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function particleValue(index: number, count: number, offset: number) {
  return seededRandom((index + 1) * 97 + count * 31 + offset * 17);
}

export function GoldParticles({ count = 26 }: { count?: number }) {
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

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: "#C9A84C",
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: "0 0 6px rgba(201, 168, 76, 0.6)",
          }}
        />
      ))}
    </div>
  );
}
