import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionDivider() {
  return <div className="section-divider" />;
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-or-pale text-2xl tracking-[0.4em] text-center select-none ${className}`}
      style={{ color: "var(--or-pale)" }}
      aria-hidden="true"
    >
      ✦
    </div>
  );
}
