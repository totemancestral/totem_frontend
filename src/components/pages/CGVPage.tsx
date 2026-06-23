import { PageHero } from "@/components/PageHero";

export function CGVPage() {
  const sections = [
    {
      title: "1. Objet",
      body: "Les présentes conditions générales de vente encadrent les commandes de coffrets numériques personnalisés Totem Ancestral, édités par SENYCE PARTNERS. Elles s'appliquent à toute commande passée sur le site.",
    },
    {
      title: "2. Produits et nature artistique",
      body: "Totem Ancestral propose des œuvres numériques personnalisées : parchemin narratif, œuvre visuelle, voix de l'ancêtre imaginaire, certificat d'authenticité et, selon l'offre, coffrets multiples ou abonnement saisonnier. Le service relève de la création artistique assistée par intelligence artificielle. Il ne constitue ni un test ADN, ni une recherche généalogique, ni une prestation divinatoire.",
    },
    {
      title: "3. Prix et paiement",
      body: "Les prix sont indiqués en euros toutes taxes comprises lorsque celles-ci sont applicables. Le paiement est réalisé via un prestataire sécurisé, notamment Stripe. La commande est validée après paiement complet et confirmation des informations nécessaires à la composition.",
    },
    {
      title: "4. Commande et composition",
      body: "Le client renseigne un questionnaire créatif. Ses réponses servent à composer une œuvre personnelle. La maison peut refuser ou suspendre une commande en cas d'usage frauduleux, de contenu illicite, de paiement non confirmé ou d'impossibilité technique manifeste.",
    },
    {
      title: "5. Livraison",
      body: "Les coffrets sont livrés par email et, lorsque l'espace personnel est disponible, depuis le compte du client. Le délai cible est de quinze minutes après paiement et questionnaire complet, trente minutes pour Totem Famille. Un retard technique exceptionnel ne peut ouvrir droit qu'à une recomposition ou un remboursement si la livraison devient impossible.",
    },
    {
      title: "6. Droit de rétractation",
      body: "Les œuvres étant personnalisées et composées à la demande, le droit de rétractation ne s'applique plus dès le lancement de la composition, conformément au Code de la consommation, notamment pour les biens personnalisés et contenus numériques fournis après accord du client.",
    },
    {
      title: "7. Garanties et support",
      body: "En cas de fichier manquant, illisible ou de défaut de livraison imputable au service, Totem Ancestral procède à une nouvelle mise à disposition ou à un remboursement. Les appréciations subjectives liées au style, au ton ou à l'interprétation artistique ne constituent pas, à elles seules, une non-conformité.",
    },
    {
      title: "8. Propriété intellectuelle",
      body: "Les textes, visuels, marques, éléments graphiques, méthodes créatives et contenus du site restent la propriété de SENYCE PARTNERS ou de ses ayants droit. Le client reçoit un droit d'usage personnel sur son coffret numérique. Toute exploitation commerciale, revente, reproduction massive ou republication sans autorisation écrite est interdite.",
    },
    {
      title: "9. Données personnelles",
      body: "Les données de commande et les réponses au questionnaire sont traitées pour composer, livrer et suivre l'œuvre. Les modalités détaillées figurent dans la Politique de confidentialité.",
    },
    {
      title: "10. Litiges",
      body: "Les présentes conditions sont régies par le droit français. En cas de difficulté, le client est invité à contacter la maison à contact@totemancestral.com afin de rechercher une solution amiable avant toute procédure.",
    },
  ];

  return (
    <>
      <PageHero
        title="Conditions générales de vente"
        subtitle="Dernière mise à jour : 18 juin 2026."
      />
      <section
        className="premium-page px-5 pb-24 md:px-10"
        style={{ background: "var(--nuit-profonde)" }}
      >
        <article
          className="premium-panel mx-auto max-w-3xl space-y-8 p-6 text-[15px] leading-[1.85] md:p-8"
          style={{ color: "var(--ivoire)" }}
        >
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
                {s.title}
              </h2>
              <p>{s.body}</p>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
