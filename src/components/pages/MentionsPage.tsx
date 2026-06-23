import { PageHero } from "@/components/PageHero";

export function MentionsPage() {
  const sections = [
    {
      title: "Éditeur",
      body: (
        <>
          SENYCE PARTNERS, maison de création artistique éditrice du service Totem Ancestral.
          <br />
          Siège social : Paris, France.
          <br />
          Contact :{" "}
          <a href="mailto:contact@totemancestral.com" className="link-gold">
            contact@totemancestral.com
          </a>
        </>
      ),
    },
    {
      title: "Directeur de la publication",
      body: "SENYCE PARTNERS.",
    },
    {
      title: "Hébergement et infrastructure",
      body: "Le site est exploité sur une infrastructure cloud sécurisée. Les services techniques du projet peuvent inclure Next.js ou Vercel pour l'application, Supabase pour l'authentification et la base de données, Cloudflare R2 pour le stockage, Stripe pour les paiements et Brevo pour les emails transactionnels.",
    },
    {
      title: "Propriété intellectuelle",
      body: "L'ensemble des contenus présents sur ce site, notamment textes, visuels, identité, interface, parcours, prompts, fichiers générés, charte graphique et signes distinctifs, est protégé par le droit de la propriété intellectuelle. Toute reproduction, extraction, diffusion ou exploitation commerciale non autorisée est interdite.",
    },
    {
      title: "Nature du service",
      body: "Totem Ancestral est une œuvre de fiction artistique personnalisée, inspirée des cosmogonies africaines et assistée par intelligence artificielle. Le site ne fournit pas de test ADN, de vérité généalogique, de diagnostic, de conseil juridique, médical ou spirituel.",
    },
    {
      title: "Signalement",
      body: "Pour signaler un contenu, une difficulté de livraison, une question de droits ou une demande relative aux données personnelles, écrivez à contact@totemancestral.com.",
    },
  ];

  return (
    <>
      <PageHero
        title="Mentions légales"
        subtitle="Informations relatives à l'éditeur et au service Totem Ancestral."
      />
      <section
        className="premium-page px-5 pb-24 md:px-10"
        style={{ background: "var(--nuit-profonde)" }}
      >
        <article
          className="premium-panel mx-auto max-w-3xl space-y-8 p-6 text-[15px] leading-[1.85] md:p-8"
          style={{ color: "var(--ivoire)" }}
        >
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
                {section.title}
              </h2>
              <p>{section.body}</p>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
