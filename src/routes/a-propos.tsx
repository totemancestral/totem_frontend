import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionDivider } from "@/components/Reveal";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Totem Ancestral" },
      { name: "description", content: "Le manifeste de la maison Totem Ancestral." },
      { property: "og:title", content: "À propos — Totem Ancestral" },
      { property: "og:description", content: "Le manifeste de la maison Totem Ancestral." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero title="La maison" subtitle="Notre manifeste." />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <article className="max-w-2xl mx-auto space-y-8 text-base md:text-lg leading-[1.9]" style={{ color: "var(--ivoire)" }}>
          <p>
            TOTEM ANCESTRAL est une maison de création artistique fondée à Paris par SENYCE PARTNERS.
            Nous composons des œuvres numériques uniques — des fables personnelles inspirées des cosmogonies africaines — assistées par intelligence artificielle.
          </p>

          <SectionDivider />

          <h2 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
            Ce que nous croyons
          </h2>
          <p>
            Nous croyons que chaque être humain mérite une histoire qui lui ressemble. Pas une vérité.
            Une fable. Une œuvre qui célèbre, qui interroge, qui transmet.
          </p>
          <p>
            Nous croyons que l'intelligence artificielle, mise au service de la sensibilité artistique,
            peut produire des objets de mémoire — pas des contenus.
          </p>

          <h2 className="h-display text-3xl mt-12" style={{ color: "var(--or-ancestral)" }}>
            Ce que nous ne faisons pas
          </h2>
          <p>
            Nous ne faisons pas de la science. Pas de la généalogie. Pas de la divination.
            Pas de l'identité. Pas du folklore.
          </p>
          <p>
            Nous faisons des œuvres. Pour célébrer un proche. Pour s'offrir un voyage intérieur.
            Pour nourrir l'imagination.
          </p>

          <h2 className="h-display text-3xl mt-12" style={{ color: "var(--or-ancestral)" }}>
            Notre exigence
          </h2>
          <p>
            Chaque œuvre porte un numéro, une signature, un certificat. Elle ne sera jamais reproduite,
            ni rééditée, ni revendue. Elle est votre exemplaire dans la collection en cours.
          </p>
          <p>
            Notre standard de référence est celui des maisons de parfumerie de niche et de la haute joaillerie :
            la rareté, l'élégance, la justesse du geste.
          </p>

          <SectionDivider />

          <p className="quote-italic text-xl md:text-2xl text-center">
            «&nbsp;Une œuvre n'est jamais finie. Elle est seulement abandonnée à celui qui la reçoit.&nbsp;»
          </p>
        </article>
      </section>
    </>
  );
}
