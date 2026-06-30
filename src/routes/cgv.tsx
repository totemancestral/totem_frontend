import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "CGV — Totem Ancestral" },
      { name: "description", content: "Conditions générales de vente de Totem Ancestral." },
      { property: "og:title", content: "CGV — Totem Ancestral" },
      { property: "og:description", content: "Conditions générales de vente de Totem Ancestral." },
    ],
  }),
  component: CGVPage,
});

const sections = [
  {
    t: "1. Objet",
    c: "Les présentes conditions régissent la vente des œuvres numériques Totem Ancestral éditées par SENYCE PARTNERS.",
  },
  {
    t: "2. Produits",
    c: "Trois offres : Totem Origine (49€), Totem Ancestral (89€), Totem Famille (199€). Chaque œuvre est numérotée, signée et accompagnée d'un certificat d'authenticité.",
  },
  {
    t: "3. Commande",
    c: "La commande est validée après réception du paiement intégral. Un email de confirmation est envoyé immédiatement.",
  },
  {
    t: "4. Livraison",
    c: "L'œuvre est livrée par email sous quinze minutes (trente minutes pour Totem Famille) après validation du questionnaire.",
  },
  {
    t: "5. Droit de rétractation",
    c: "S'agissant d'une œuvre numérique personnalisée, composée à votre demande, le droit de rétractation ne s'applique pas une fois la composition lancée (article L221-28 du Code de la consommation).",
  },
  {
    t: "6. Garanties",
    c: "Si une difficulté technique empêche la livraison, l'œuvre est recomposée ou remboursée intégralement.",
  },
  {
    t: "7. Litiges",
    c: "Les présentes conditions sont régies par le droit français. Tout litige relève de la compétence des tribunaux de Paris.",
  },
];

function CGVPage() {
  return (
    <>
      <PageHero title="Conditions générales de vente" />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <article
          className="max-w-2xl mx-auto space-y-8 text-[15px] leading-[1.85]"
          style={{ color: "var(--ivoire)" }}
        >
          {sections.map((s) => (
            <div key={s.t}>
              <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
                {s.t}
              </h2>
              <p>{s.c}</p>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
