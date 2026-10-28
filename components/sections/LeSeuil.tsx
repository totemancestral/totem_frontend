import { Reveal } from "@/components/ui/Reveal";
import { LeSeuilPinned } from "@/components/sections/LeSeuilPinned";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function LeSeuil({ dict }: { dict: Dictionary["leSeuil"] }) {
  return (
    <section id="experience" className="scroll-mt-24 bg-indigo">
      <div className="site-section">
      <div className="site-container">
        {/* en-tête */}
        <Reveal variant="up" className="flex flex-col gap-6 text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <p className="font-display mt-2 text-xl italic text-orpale">{dict.leadIn}</p>
            <h2 className="font-display text-4xl text-ivoire lg:text-6xl">{dict.title}</h2>
          </div>
          <p className="max-w-xs text-sm text-grisclair">{dict.intro}</p>
        </Reveal>

      </div>
      </div>

      <LeSeuilPinned gestes={dict.gestes} />
    </section>
  );
}
