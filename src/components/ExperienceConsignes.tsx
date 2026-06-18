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
    <section className="px-5 py-24 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
            <Ornament />
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-2 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-10 md:gap-12">
          {consignes.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.1}>
              <article className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
                <div
                  className={`relative overflow-hidden rounded-lg border ${i % 2 === 1 ? "md:order-2" : ""}`}
                  style={{ aspectRatio: "4/3", borderColor: "rgba(201,168,76,0.24)" }}
                >
                  <img
                    src={c.img}
                    alt={c.title ?? c.text}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 40%, var(--nuit-profonde) 100%)",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="h-display text-4xl" style={{ color: "rgba(201,168,76,0.42)" }}>
                    {c.n}
                  </span>
                  {c.title && (
                    <h3
                      className="h-display text-2xl md:text-3xl"
                      style={{ color: "var(--or-pale)" }}
                    >
                      {c.title}
                    </h3>
                  )}
                  <p
                    className="body-copy text-[15px] md:text-base"
                    style={{ color: "rgba(254,252,240,0.9)" }}
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
