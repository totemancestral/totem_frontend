import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import styles from "./Manifeste.module.css";

export default function Manifeste({ dict }: { dict: Dictionary["manifeste"] }) {
  return (
    <section className={`site-section ${styles.section}`}>
      <div className={`site-container ${styles.composition}`}>
      <div className={styles.content}>
      <Reveal variant="up">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-ivoire lg:text-5xl">{dict.title}</h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-grisclair">{dict.intro}</p>
      </Reveal>

        <Reveal variant="left" className="site-stack flex min-w-0 flex-col gap-8 lg:gap-10">
          {dict.points.map((point, i) => (
            <Reveal key={point.title} variant="up" delay={i * 100} className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-ivoire">{point.title}</h3>
              <p className="text-sm leading-relaxed text-grisclair lg:text-base">
                {point.text}
              </p>
            </Reveal>
          ))}
        </Reveal>
      </div>

        {/* Photo originale, fondue dans la section sans cadre ni nouvel asset. */}
        <div className={styles.artwork} aria-hidden="true">
            <Image
              src="/images/manifeste.png"
              alt=""
              fill
              sizes="(min-width: 2200px) 1306px, (min-width: 1024px) 63vw, 92vw"
              className={styles.image}
            />
        </div>
      </div>
    </section>
  );
}
