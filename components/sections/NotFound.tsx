"use client";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";

const copy = {
  fr: {
    eyebrow: "Chemin égaré",
    title: "Ce chemin n'existe pas.",
    subtitle: "Même les ancêtres se perdent parfois dans le brouillard des origines.",
    text: "La page que vous cherchez a disparu, ou n'a peut-être jamais existé.",
    button: "Retourner à l'accueil",
  },
  en: {
    eyebrow: "Lost path",
    title: "This path doesn't exist.",
    subtitle: "Even the ancestors sometimes lose their way in the fog of origins.",
    text: "The page you're looking for has vanished, or perhaps never existed.",
    button: "Return home",
  },
} as const;

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "fr";
  const t = copy[locale];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-nuit">
      {/* motif tournant en arrière-plan */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_150s_linear_infinite] opacity-20"
        viewBox="0 0 760 760"
      >
        <g stroke="#C9A84C" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.10" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.10" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="592" y2="88" opacity="0.07" />
          <line x1="380" y1="380" x2="592" y2="672" opacity="0.07" />
          <line x1="380" y1="380" x2="168" y2="672" opacity="0.07" />
          <line x1="380" y1="380" x2="168" y2="88" opacity="0.07" />
        </g>
      </svg>

      {/* 404 géant en filigrane */}
      <span className="font-display pointer-events-none absolute left-1/2 top-[46%] z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[22rem] font-light text-ivoire opacity-[0.045]">
        404
      </span>

      {/* barre du haut */}
      <div className="relative z-10 flex items-center px-6 py-9 lg:px-16">
        <Brand lang={locale} />
      </div>

      {/* contenu */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24 text-center lg:px-16">
        <svg width="34" height="55" viewBox="0 0 200 320" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <polygon points="100,8 145,36 162,120 152,190 130,255 100,312 70,255 48,190 38,120 55,36" fill="#0D0D1A" fillOpacity="0.5" />
          <line x1="100" y1="8" x2="100" y2="312" strokeWidth="1.6" />
          <rect x="62" y="110" width="28" height="10" strokeWidth="1.6" />
          <rect x="110" y="110" width="28" height="10" strokeWidth="1.6" />
        </svg>

        <p className="text-xs uppercase tracking-[0.2em] text-or">{t.eyebrow}</p>
        <h1 className="font-display max-w-xl text-4xl font-light leading-tight text-ivoire lg:text-5xl">
          {t.title}
        </h1>
        <p className="font-display max-w-md text-xl italic text-orpale">{t.subtitle}</p>
        <p className="max-w-sm text-sm text-grisclair">{t.text}</p>

        <Button href={`/${locale}`} variant="outline" className="mt-3">
          {t.button}
        </Button>
      </div>
    </div>
  );
}
