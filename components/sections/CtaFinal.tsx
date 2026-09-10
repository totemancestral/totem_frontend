import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export default function CtaFinal({ dict, lang }: { dict: Dictionary["ctaFinal"]; lang: Locale }) {
  return (
    <div className="relative flex flex-col items-center gap-6 overflow-hidden bg-nuit px-6 py-24 text-center lg:py-32">
      {/* lueur douce derrière l'icône */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0) 70%)",
        }}
      />
      {/* motif tournant en arrière-plan */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_90s_linear_infinite] opacity-55"
        viewBox="0 0 760 760"
      >
        <g stroke="#EDD99A" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.10" />
          <line x1="380" y1="380" x2="592" y2="88" opacity="0.08" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="592" y2="672" opacity="0.08" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.10" />
          <line x1="380" y1="380" x2="168" y2="672" opacity="0.08" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="168" y2="88" opacity="0.08" />
          <line x1="380" y1="380" x2="486" y2="52" opacity="0.06" />
          <line x1="380" y1="380" x2="656" y2="150" opacity="0.06" />
          <line x1="380" y1="380" x2="708" y2="274" opacity="0.06" />
          <line x1="380" y1="380" x2="708" y2="486" opacity="0.06" />
          <line x1="380" y1="380" x2="656" y2="610" opacity="0.06" />
          <line x1="380" y1="380" x2="486" y2="708" opacity="0.06" />
          <line x1="380" y1="380" x2="274" y2="708" opacity="0.06" />
          <line x1="380" y1="380" x2="104" y2="610" opacity="0.06" />
          <line x1="380" y1="380" x2="52" y2="486" opacity="0.06" />
          <line x1="380" y1="380" x2="52" y2="274" opacity="0.06" />
          <line x1="380" y1="380" x2="104" y2="150" opacity="0.06" />
          <line x1="380" y1="380" x2="274" y2="52" opacity="0.06" />
        </g>
      </svg>

      {/* contenu, au-dessus du décor grâce à z-10 */}
      <Reveal
        variant="scale"
        className="relative z-10 h-44 w-44 lg:h-56 lg:w-56"
        style={{
          WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 78%)",
          maskImage: "radial-gradient(circle, black 55%, transparent 78%)",
        }}
      >
        <Image
          src="/images/logo_totem_1.svg"
          alt="Masque totem ancestral"
          fill
          sizes="(min-width: 1024px) 224px, 176px"
          className="object-contain"
        />
      </Reveal>

      <Reveal variant="up" delay={120} className="relative z-10 flex flex-col items-center gap-6">
        <h2 className="font-display mt-1 text-3xl text-ivoire lg:text-5xl">
          {dict.title}
        </h2>
        <p className="max-w-md text-sm text-grisclair">{dict.text}</p>
        <Button className="mt-2" href={`/${lang}/inscription`}>{dict.cta}</Button>
      </Reveal>
    </div>
  );
}
