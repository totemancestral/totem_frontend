"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function ConsultationQuestion({ dict, lang }: { dict: Dictionary["consultationQuestion"]; lang: Locale }) {
  const [selected, setSelected] = useState<number | null>(null);
  const hasSelection = selected !== null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit">
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_120s_linear_infinite] opacity-35"
        viewBox="0 0 760 760"
      >
        <g stroke="#C9A84C" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.08" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.08" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.08" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.08" />
        </g>
      </svg>

      {/* barre du haut */}
      <div className="relative z-10 flex items-center justify-between px-6 py-8 lg:px-14">
        <Brand lang={lang} />
        <Link href={`/${lang}/consultations`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.cancel}
        </Link>
      </div>

      {/* contenu */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6 py-8 text-center lg:px-14">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</span>
          <h1 className="font-display max-w-2xl text-2xl leading-tight text-ivoire lg:text-4xl">{dict.title}</h1>
          <p className="font-display max-w-md text-lg italic text-grisclair">{dict.subtitle}</p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {dict.options.map((opt, idx) => {
            const isSelected = idx === selected;
            return (
              <button
                key={opt}
                onClick={() => setSelected(idx)}
                aria-pressed={isSelected}
                className={`flex min-h-24 items-center justify-center border p-7 text-center transition-colors duration-300 ${
                  isSelected ? "border-or bg-indigo text-ivoire" : "border-ombre bg-transparent text-grisclair hover:border-orpale"
                }`}
              >
                <span className="text-lg">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* navigation basse */}
      <div className="relative z-10 flex items-center justify-between px-6 py-8 lg:px-14">
        <span className="text-xs text-grisclair">{dict.privacyNote}</span>
        {hasSelection ? (
          <Button href={`/${lang}/consultation-tirage`}>{dict.nextButton}</Button>
        ) : (
          <Button className="pointer-events-none opacity-40">{dict.nextButton}</Button>
        )}
      </div>
    </div>
  );
}
