"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function Faq({ dict, lang }: { dict: Dictionary["faq"]; lang: Locale }) {
  // null = aucune question sélectionnée ("état simple"). Sur desktop, le
  // cercle affiche quand même une réponse par défaut (la première).
  const [active, setActive] = useState<number | null>(null);
  const current = dict.items[active ?? 0];

  function toggle(i: number) {
    // Si on clique sur la question déjà active, on revient à l'état simple.
    // Sinon, on ouvre celle qu'on vient de cliquer.
    setActive(active === i ? null : i);
  }

  return (
    <section id="faq" className="scroll-mt-24 px-6 py-24 lg:px-16 lg:py-32">
      <Reveal variant="up" className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="font-display mt-5 text-xl italic text-orpale">{dict.lead}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-grisclair">{dict.intro}</p>
      </Reveal>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center gap-16 lg:mt-20 lg:flex-row lg:items-start lg:gap-20">
        {/* la liste des questions */}
        <Reveal variant="left" className="flex w-full flex-[1.15] flex-col gap-2">
          {dict.items.map((item, i) => {
            const isActive = i === active;
            return (
              <div key={item.question}>
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isActive}
                  aria-controls={`faq-answer-${i}`}
                  className="flex w-full items-center justify-between gap-6 py-4 text-left"
                >
                  <span
                    className={`text-lg ${isActive ? "text-or" : "text-grisclair"}`}
                  >
                    {item.question}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className={`shrink-0 transition-transform duration-300 ${isActive ? "rotate-45" : ""}`}
                  >
                    <line x1="8" y1="1" x2="8" y2="15" stroke={isActive ? "#C9A84C" : "#555555"} strokeWidth="1.5" />
                    <line x1="1" y1="8" x2="15" y2="8" stroke={isActive ? "#C9A84C" : "#555555"} strokeWidth="1.5" />
                  </svg>
                </button>

                {/* réponse en accordéon : uniquement sur mobile, juste sous la question */}
                <div
                  id={`faq-answer-${i}`}
                  className={`overflow-hidden transition-all duration-300 lg:hidden ${
                    isActive ? "max-h-40 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-sm text-grisclair">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </Reveal>

        {/* la réponse, dans un cercle-photo + pagination : réservé au bureau */}
        <Reveal variant="right" className="hidden shrink-0 flex-col items-center gap-5 lg:flex">
          <div className="relative h-85 w-85 overflow-hidden rounded-full border border-ombre bg-nuit">
            <Image
              src={current.img}
              alt=""
              fill
              className="object-cover grayscale contrast-[1.15] brightness-110 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-or mix-blend-color" />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle, transparent 26%, var(--color-nuit) 76%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <p className="font-display text-lg italic text-ivoire lg:text-xl">
                {current.answer}
              </p>
            </div>
          </div>
          <span className="text-xs tracking-widest text-gris">
            {pad((active ?? 0) + 1)} / {pad(dict.items.length)}
          </span>
        </Reveal>
      </div>

      <div className="mt-14 text-center">
        <Link href={`/${lang}/faq`} className="text-xs uppercase tracking-[0.14em] text-or underline underline-offset-4">
          {dict.seeAll}
        </Link>
      </div>
    </section>
  );
}
