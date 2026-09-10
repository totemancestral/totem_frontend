"use client";
import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Petit composant local : évite de dupliquer le SVG de la flèche pour
// les 4 boutons (précédent/suivant × mobile/desktop).
function ArrowButton({
  direction,
  onClick,
  label,
  className = "",
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        relative flex h-12 w-12 shrink-0 items-center justify-center
        overflow-hidden border border-or text-or transition-colors duration-300
        before:content-[''] before:absolute before:inset-y-0 before:left-0
        before:w-0 before:bg-or before:transition-[width] before:duration-300 before:ease-out
        hover:text-nuit hover:before:w-full
        ${className}
      `}
    >
      <svg
        className="relative z-10"
        width="16"
        height="14"
        viewBox="0 0 16 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {direction === "prev" ? (
          <>
            <line x1="16" y1="7" x2="2" y2="7" />
            <polyline points="7,1 1,7 7,13" />
          </>
        ) : (
          <>
            <line x1="0" y1="7" x2="14" y2="7" />
            <polyline points="9,1 15,7 9,13" />
          </>
        )}
      </svg>
    </button>
  );
}

export default function Temoignages({ dict }: { dict: Dictionary["temoignages"] }) {
  const [index, setIndex] = useState(0);
  const current = dict.items[index];

  function prev() {
    setIndex((index - 1 + dict.items.length) % dict.items.length);
  }

  function next() {
    setIndex((index + 1) % dict.items.length);
  }

  return (
    <section className="bg-indigo px-6 py-24 lg:px-16 lg:py-32">
      <Reveal variant="up" className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="font-display mt-5 text-xl italic text-orpale">{dict.lead}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </Reveal>

      <div className="mx-auto mt-16 flex max-w-5xl flex-col items-center gap-6 lg:mt-20 lg:flex-row lg:gap-7">
        {/* flèche précédente : visible uniquement à partir de lg, à gauche de la carte */}
        <ArrowButton direction="prev" onClick={prev} label={dict.prevLabel} className="hidden lg:flex" />

        <Reveal variant="scale" className="flex w-full flex-1 flex-col border border-ombre lg:min-h-[340px] lg:flex-row lg:items-stretch">
          <div className="relative h-[220px] w-full shrink-0 bg-nuit lg:h-auto lg:w-[280px]">
            <Image
              src={current.img}
              alt=""
              fill
              className="object-cover grayscale contrast-[1.15] brightness-110 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-or mix-blend-color" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 p-8 lg:p-14">
            <span className="font-display text-5xl leading-none text-or">&quot;</span>
            <p className="font-display text-xl italic text-orpale lg:text-2xl">
              {current.quote}
            </p>
            <p className="text-sm text-or">
              — {current.name} · {current.city}
            </p>
            <div className="flex items-center justify-end">
              <span className="text-xs tracking-[0.12em] text-gris">
                {pad(index + 1)} / {pad(dict.items.length)}
              </span>
            </div>
          </div>
        </Reveal>

        {/* flèche suivante : visible uniquement à partir de lg, à droite de la carte */}
        <ArrowButton direction="next" onClick={next} label={dict.nextLabel} className="hidden lg:flex" />

        {/* les deux flèches côte à côte, uniquement sur mobile */}
        <div className="flex gap-4 lg:hidden">
          <ArrowButton direction="prev" onClick={prev} label={dict.prevLabel} />
          <ArrowButton direction="next" onClick={next} label={dict.nextLabel} />
        </div>
      </div>
    </section>
  );
}
