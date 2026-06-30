import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Totem Ancestral" },
      { name: "description", content: "Questions fréquentes sur l'expérience Totem Ancestral." },
      { property: "og:title", content: "FAQ — Totem Ancestral" },
      {
        property: "og:description",
        content: "Questions fréquentes sur l'expérience Totem Ancestral.",
      },
    ],
  }),
  component: FAQPage,
});

type Item = { q: string; a: string };
type Cat = { title: string; items: Item[] };

const categories: Cat[] = [
  {
    title: "La nature de l'œuvre",
    items: [
      {
        q: "S'agit-il d'un test ADN ou généalogique ?",
        a: "Non. Totem Ancestral n'est ni un test ADN, ni un service de généalogie. C'est une fable artistique : une œuvre numérique inspirée de vos réponses à dix questions intimes, composée pour célébrer un imaginaire — pas pour révéler une vérité.",
      },
      {
        q: "Chaque œuvre est-elle vraiment unique ?",
        a: "Oui. Chaque coffret porte un numéro, une signature et un certificat d'authenticité. Aucune œuvre n'est jamais reproduite, rééditée ou revendue.",
      },
      {
        q: "L'IA remplace-t-elle l'artiste ?",
        a: "Non. Nos directions artistiques composent les cadres, les références, les mouvements narratifs. L'intelligence artificielle est notre outil — pas notre auteur.",
      },
    ],
  },
  {
    title: "L'expérience pratique",
    items: [
      {
        q: "Combien de temps prend la composition ?",
        a: "Le questionnaire dure environ quinze minutes. L'œuvre est livrée par email sous quinze minutes après validation (trente minutes pour le Totem Famille).",
      },
      {
        q: "Sous quel format reçoit-on l'œuvre ?",
        a: "Vous recevez un parchemin PDF, une œuvre visuelle PNG haute résolution, et — pour Ancestral et Famille — un fichier audio MP3 de 90 secondes.",
      },
      {
        q: "Puis-je offrir une œuvre ?",
        a: "Absolument. Chaque commande inclut une carte cadeau gratuite, et vous pouvez désigner un destinataire au moment du paiement.",
      },
    ],
  },
  {
    title: "La technique",
    items: [
      {
        q: "L'œuvre est-elle imprimable ?",
        a: "Oui. L'œuvre visuelle est livrée en très haute résolution, encadrable, imprimable jusqu'au format A2.",
      },
      {
        q: "Mes données sont-elles protégées ?",
        a: "Vos réponses sont utilisées uniquement pour composer votre œuvre, puis archivées de manière sécurisée. Conformité RGPD complète.",
      },
    ],
  },
  {
    title: "La maison",
    items: [
      {
        q: "Qui est derrière Totem Ancestral ?",
        a: "Totem Ancestral est une maison de création artistique fondée à Paris par SENYCE PARTNERS, à la croisée des cosmogonies africaines, de la littérature et des arts numériques.",
      },
      {
        q: "Comment vous contacter ?",
        a: "Par email à contact@totemancestral.com ou via notre formulaire de contact. Nous répondons sous 48h.",
      },
    ],
  },
];

function AccordionItem({ q, a }: Item) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(201,168,76,0.18)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full py-6 flex items-center justify-between gap-6 text-left group"
      >
        <span className="text-base md:text-lg font-semibold" style={{ color: "var(--ivoire)" }}>
          {q}
        </span>
        <span style={{ color: "var(--or-ancestral)" }} className="shrink-0">
          {open ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
        </span>
      </button>
      {open && (
        <div
          className="pb-6 pr-10 text-[15px] leading-[1.8] animate-fade-in"
          style={{ color: "rgba(254,252,240,0.85)" }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

function FAQPage() {
  return (
    <>
      <PageHero
        title="Questions fréquentes"
        subtitle="Tout ce que vous avez voulu nous demander avant de composer."
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-3xl mx-auto flex flex-col gap-16">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h2
                className="h-display text-2xl md:text-3xl mb-6 pb-4 border-b"
                style={{ color: "var(--or-pale)", borderColor: "rgba(201,168,76,0.3)" }}
              >
                {cat.title}
              </h2>
              <div>
                {cat.items.map((it) => (
                  <AccordionItem key={it.q} {...it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
