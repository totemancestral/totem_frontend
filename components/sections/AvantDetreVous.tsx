import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Traitement duotone commun aux 3 photos, réutilisé tel quel sur chaque carte.
const duotone = "object-cover grayscale contrast-[1.15] brightness-110 mix-blend-luminosity";

// Les photos ne sont pas un contenu traduisible, donc elles restent ici
// plutôt que dans le dictionnaire — associées à l'ordre des 3 cartes.
const images = [
  "/images/avant_être_vous_0.png",
  "/images/avant_être_vous_1.png",
  "/images/avant_être_vous_2.png",
];
const marginTops = ["", "lg:mt-16", "lg:mt-6"];

export default function AvantDetreVous({ dict }: { dict: Dictionary["avantDetreVous"] }) {
  return (
    <section className="bg-indigo px-6 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-6xl">
        {/* en-tête de section */}
        <Reveal variant="up" className="flex flex-col gap-6 text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <p className="font-display italic text-xl text-orpale mt-2">{dict.leadIn}</p>
            <h2 className="font-display text-4xl text-ivoire lg:text-6xl">{dict.title}</h2>
          </div>
          <p className="max-w-xs text-sm text-grisclair">{dict.intro}</p>
        </Reveal>

        {/* galerie : empilée sur mobile, 3 colonnes décalées à partir de lg */}
        <div className="mt-16 flex flex-col gap-8 lg:mt-24 lg:flex-row lg:items-start">
          {dict.cards.map((card, i) => (
            <Reveal
              key={card.title}
              variant="scale"
              delay={i * 120}
              className={`relative h-[400px] overflow-hidden border border-ombre lg:h-[600px] lg:flex-1 ${marginTops[i]}`}
            >
              <Image src={images[i]} alt="" fill className={duotone} />
              <div className="absolute inset-0 bg-or mix-blend-color" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-nuit via-nuit/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
                <h3 className="text-lg font-medium text-ivoire">{card.title}</h3>
                <p className="text-sm text-grisclair">{card.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
