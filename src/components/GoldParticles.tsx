import { useMemo } from "react";

export function GoldParticles({ count = 26 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 2.5,
        delay: Math.random() * 18,
        duration: 14 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.4,
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
