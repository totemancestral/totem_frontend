"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale";

type RevealProps = {
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

// Reproduit l'effet de révélation au scroll de la maquette (titres, cartes,
// photos, blocs de texte) : la maquette utilisait "animation-timeline: view()",
// non supporté partout, donc on obtient le même résultat avec un
// IntersectionObserver qui bascule la classe "is-visible" (voir .reveal
// dans globals.css). Rejoue à chaque entrée/sortie du viewport, comme
// l'original piloté par le scroll.
export function Reveal({
  as,
  variant = "up",
  delay = 0,
  className = "",
  style,
  children,
}: RevealProps) {
  const As = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "is-visible" : ""} ${className}`}
      style={{ ...style, ...(visible && delay ? { transitionDelay: `${delay}ms` } : null) }}
    >
      {children}
    </As>
  );
}
