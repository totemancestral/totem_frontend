import type { ReactNode } from "react";
import { Ornament } from "./Reveal";

export function PageHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="px-5 pb-12 pt-36 text-center md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <Ornament />
        <h1 className="h-display text-4xl md:text-6xl" style={{ color: "var(--or-ancestral)" }}>
          {title}
        </h1>
        {subtitle && <p className="quote-italic text-lg md:text-xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
