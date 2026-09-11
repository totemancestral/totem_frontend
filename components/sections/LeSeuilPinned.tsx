"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Geste = Dictionary["leSeuil"]["gestes"][number];

// Séquence "image fixe, texte qui défile" (façon deriv.com) : la photo reste
// collée à l'écran (position: sticky) pendant que les 4 textes défilent
// normalement à côté, au rythme naturel du scroll — aucun calcul de scroll
// en JS, aucun blocage. On observe juste quel texte est le plus proche du
// centre de l'écran pour savoir quelle photo doit être affichée, et on la
// fait fondre (transition CSS classique) vers la suivante.
export function LeSeuilPinned({ gestes }: { gestes: Geste[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setActiveIndex(index);
        });
      },
      // bande étroite au centre de l'écran : le texte qui la traverse
      // devient "actif" (et sa photo s'affiche).
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [gestes]);

  return (
    <div className="mx-auto mt-16 hidden max-w-6xl gap-16 px-16 lg:mt-24 lg:flex">
      {/* photo : reste fixée à l'écran, centrée verticalement comme le texte à côté */}
      <div className="sticky top-0 flex h-screen shrink-0 items-center lg:flex-[1.7]">
        <div className="relative h-[560px] w-full max-w-xl overflow-hidden border border-ombre bg-nuit">
          {gestes.map((geste, i) => (
            <div
              key={geste.title}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            >
              <Image
                src={geste.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 576px, 100vw"
                className="object-cover grayscale contrast-[1.1] brightness-105"
              />
              <div className="absolute inset-0 bg-or opacity-45 mix-blend-color" />
            </div>
          ))}
        </div>
      </div>

      {/* texte : défile normalement, s'estompe quand il n'est plus au centre */}
      <div className="flex-1 py-24">
        {gestes.map((geste, i) => (
          <div
            key={geste.title}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-index={i}
            className="flex min-h-[65vh] flex-col justify-center gap-3 transition-opacity duration-700 ease-out"
            style={{ opacity: i === activeIndex ? 1 : 0.15 }}
          >
            <h3 className="text-xl font-medium text-ivoire lg:text-2xl">{geste.title}</h3>
            <p className="text-sm leading-relaxed text-grisclair lg:text-base">{geste.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
