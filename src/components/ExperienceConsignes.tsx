import { useTranslations } from "next-intl";
import { Reveal, Ornament } from "./Reveal";

const posture = "/assets/avant-traverser-1-posez-le-monde.png";
const volume = "/assets/avant-traverser-2-ouvrez-les-oreilles.png";
const coeur = "/assets/avant-traverser-3-parlez-vrai.png";
const heritage = "/assets/avant-traverser-4-gardez-le-totem.png";

const consigneImages = [posture, volume, coeur, heritage];

type Consigne = {
  title?: string;
  text: string;
};

export function ExperienceConsignes() {
  const t = useTranslations("home.instructions");
  const consignes = (t.raw("items") as Consigne[]).map((item, index) => ({
    ...item,
    n: String(index + 1).padStart(2, "0"),
    img: consigneImages[index] ?? posture,
  }));

  return (
    <section
      className="px-5 py-28 md:px-10 md:py-40"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
            <Ornament />
            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              {t("eyebrow")}
            </p>
            <h2 className="h-display text-5xl md:text-7xl" style={{ color: "var(--ivoire)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-2 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-col gap-24 md:gap-36">
          {consignes.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.1}>
              <article className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
                <div
                  className={`relative overflow-hidden rounded-sm border shadow-2xl ${i % 2 === 1 ? "md:order-2" : ""}`}
                  style={{ aspectRatio: "4/3", borderColor: "rgba(216,173,77,0.24)" }}
                >
                  <img
                    src={c.img}
                    alt={c.title ?? c.text}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 hover:scale-105"
                    style={{ filter: "grayscale(1) brightness(0.68)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 40%, var(--nuit-profonde) 100%)",
                    }}
                  />
                </div>
                <div className={`flex flex-col gap-5 ${i % 2 === 1 ? "md:text-right" : ""}`}>
                  <span className="h-display text-6xl" style={{ color: "rgba(216,173,77,0.26)" }}>
                    {c.n}
                  </span>
                  {c.title && (
                    <h3
                      className="h-display text-4xl md:text-5xl"
                      style={{ color: "var(--ivoire)" }}
                    >
                      {c.title}
                    </h3>
                  )}
                  <p
                    className="body-copy text-lg md:text-xl"
                    style={{ color: "rgba(226,225,238,0.82)" }}
                  >
                    {c.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
