"use client";

import { useEffect, useState } from "react";
import { AudioLines, ChevronRight, Eye, Feather, Sparkles } from "lucide-react";

type Locale = "fr" | "en";

const layers = {
  fr: [
    { label: "La matière", value: "Vos réponses deviennent une fable" },
    { label: "La présence", value: "Une image pensée pour vous" },
    { label: "La transmission", value: "Une voix à garder et partager" },
  ],
  en: [
    { label: "The matter", value: "Your answers become a fable" },
    { label: "The presence", value: "An image composed for you" },
    { label: "The transmission", value: "A voice to keep and share" },
  ],
} as const;

const layerIcons = [Feather, Eye, AudioLines] as const;

export function LiquidGlassPreview({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const copy = layers[locale];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % copy.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [copy.length]);

  const ActiveIcon = layerIcons[active];

  return (
    <div className="liquid-preview-shell">
      <div className="liquid-preview-glow" />
      <div className="liquid-preview-window">
        <div className="liquid-preview-toolbar">
          <div className="liquid-window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="liquid-preview-route">totem / composition / 001</span>
          <span className="liquid-preview-status">
            <span className="liquid-status-dot" />
            {locale === "fr" ? "Flux vivant" : "Live flow"}
          </span>
        </div>

        <div className="liquid-preview-canvas">
          <div className="liquid-preview-art">
            <img src="/assets/totem-logo.webp" alt="" />
            <span className="liquid-art-ring liquid-art-ring-one" />
            <span className="liquid-art-ring liquid-art-ring-two" />
            <span className="liquid-art-spark liquid-art-spark-one" />
            <span className="liquid-art-spark liquid-art-spark-two" />
          </div>

          <div className="liquid-preview-insight">
            <div className="liquid-insight-index">
              <span>0{active + 1}</span>
              <span>/ 03</span>
            </div>
            <div className="liquid-insight-icon">
              <ActiveIcon size={18} strokeWidth={1.5} />
            </div>
            <p className="liquid-preview-label">{copy[active].label}</p>
            <p className="liquid-preview-value">{copy[active].value}</p>
            <div className="liquid-preview-meter">
              {copy.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`${item.label} ${index + 1}`}
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className={index === active ? "is-active" : ""}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="liquid-preview-footer">
          <span>{locale === "fr" ? "Intelligence symbolique" : "Symbolic intelligence"}</span>
          <span className="liquid-preview-footer-link">
            {locale === "fr" ? "Voir le geste" : "See the gesture"}
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
