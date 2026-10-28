"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getSeuilImage } from "@/lib/seuil-images";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import styles from "./SeuilImmersif.module.css";

type Geste = Dictionary["leSeuil"]["gestes"][number];
const positions: Record<string, string> = {
  "/images/seuil_0.png": "45% 50%",
  "/images/seuil_1.png": "45% 50%",
  "/images/seuil_2.png": "50% 50%",
  "/images/seuil_3.png": "55% 50%",
};

export function LeSeuilPinned({ gestes }: { gestes: Geste[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    // Read once per animation frame; native scrolling remains unrestricted.
    function update() {
      frame = 0;
      const center = window.innerHeight / 2;
      let nearest = 0;
      let distance = Infinity;
      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const bounds = item.getBoundingClientRect();
        const nextDistance = Math.abs(bounds.top + bounds.height / 2 - center);
        if (nextDistance < distance) { distance = nextDistance; nearest = index; }
      });
      setActiveIndex(current => current === nearest ? current : nearest);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [gestes]);

  if (!gestes.length) return null;

  return (
    <div className={styles.sequence} data-seuil-immersif data-active-step={activeIndex}>
      <div className={styles.backdrop} aria-hidden="true">
        {gestes.map((geste, index) => (
          <div key={geste.title} className={styles.scene} style={{ opacity: index === activeIndex ? 1 : 0 }}>
            <Image
              src={getSeuilImage(geste.image)} alt="" fill sizes="100vw"
              className={styles.image}
              style={{ objectPosition: positions[geste.image] ?? "center" }}
            />
          </div>
        ))}
        <div className={styles.shade} />
      </div>
      <div className={styles.steps}>
        {gestes.map((geste, index) => (
          <div key={geste.title} ref={el => { itemRefs.current[index] = el; }} className={styles.step} data-seuil-step={index}>
            <div className="site-container">
              <div className={styles.copy}>
                <h3>{geste.title}</h3>
                <p>{geste.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
