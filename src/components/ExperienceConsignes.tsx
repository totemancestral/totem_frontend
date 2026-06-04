import { useTranslations } from "next-intl";
import { Reveal, Ornament } from "./Reveal";

const posture = "/assets/consigne-1-posture.jpg";
const volume = "/assets/consigne-2-volume.jpg";
const coeur = "/assets/consigne-3-coeur.jpg";
const heritage = "/assets/consigne-4-heritage.jpg";

const consigneImages = [posture, volume, coeur, heritage];

type Consigne = {
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
    <section className="py-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
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

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consignes.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.1}>
              <article
                className="card-totem h-full flex flex-col gap-5 overflow-hidden"
                style={{ padding: 0 }}
              >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={c.img}
                    alt={c.text}
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
                <div className="px-6 pb-6 flex flex-col gap-4 flex-1">
                  <span className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
                    {c.n}
                  </span>
                  <p
                    className="text-[15px] leading-[1.7]"
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
