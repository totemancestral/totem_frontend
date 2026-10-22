"use client";

import { useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function ProofBand({ dict }: { dict: Dictionary["proofBand"] }) {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-label={dict.label} className="relative overflow-hidden border-y border-ombre bg-nuit py-5">
      <p className="sr-only">{dict.items.join(" · ")}</p>
      <div aria-hidden="true" className="totem-marquee flex w-max text-2xl text-orpale font-display"
        style={{ animationPlayState: paused ? "paused" : "running" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {dict.items.map((item) => <span key={item} className="flex items-center gap-10 pr-10">{item}<span>✦</span></span>)}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}
        className="absolute inset-y-0 right-0 border-l border-ombre bg-nuit px-4 text-xs text-ivoire focus-visible:outline-2 focus-visible:outline-or motion-reduce:hidden">
        {paused ? dict.resume : dict.pause}
      </button>
    </section>
  );
}
