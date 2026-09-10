"use client";
import { useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Props = {
  dict: Dictionary["faqPage"];
};

let accordionIdCounter = 0;

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const [panelId] = useState(() => `faq-page-answer-${accordionIdCounter++}`);
  return (
    <div className="border-b border-ombre py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-6 text-left"
      >
        <span className={`text-base ${open ? "text-or" : "text-ivoire"}`}>{question}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className={`shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <line x1="8" y1="1" x2="8" y2="15" stroke={open ? "#C9A84C" : "#888888"} strokeWidth="1.5" />
          <line x1="1" y1="8" x2="15" y2="8" stroke={open ? "#C9A84C" : "#888888"} strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <p id={panelId} className="mt-4 text-sm leading-relaxed text-grisclair">
          {answer}
        </p>
      )}
    </div>
  );
}

// Nav (fixe, transparente en haut) et Footer viennent du layout partagé
// (marketing) — cette page ne fournit que son propre contenu, avec assez
// de padding en haut pour dégager la barre de navigation.
export default function FaqPage({ dict }: Props) {
  return (
    <div className="min-h-screen bg-nuit pt-32 lg:pt-40">
      {/* en-tête */}
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pb-14 text-center lg:px-16">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
        <p className="font-display text-xl italic text-orpale">{dict.subtitle}</p>
      </div>

      {/* catégories */}
      <div className="mx-auto flex max-w-2xl flex-col gap-14 px-6 pb-24 lg:px-16">
        {dict.categories.map((cat) => (
          <div key={cat.title}>
            <h2 className="font-display mb-2 border-b border-ombre pb-4 text-2xl text-orpale">
              {cat.title}
            </h2>
            <div>
              {cat.items.map((item) => (
                <AccordionItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
