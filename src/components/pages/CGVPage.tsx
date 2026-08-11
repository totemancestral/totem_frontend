import { LegalLayout, type LegalSection } from "@/components/pages/LegalLayout";
import { LEGAL, legalAddress } from "@/lib/legal";

export function CGVPage() {
  const sections: LegalSection[] = [
    {
      title: "1. Objet et champ d'application",
      body: (
        <p>
          Les présentes conditions générales de vente (CGV) encadrent toute commande d'œuvres
          numériques personnalisées {LEGAL.brand}, éditées par {LEGAL.company} ({LEGAL.form}),
          passée sur le site {LEGAL.domain}. Toute commande implique l'acceptation pleine et entière
          des présentes CGV, opposables au client dans leur version en vigueur au jour de la
          commande.
        </p>
      ),
    },
    {
      title: "2. Identité du vendeur",
      body: (
        <p>
          {LEGAL.company}, {LEGAL.form} au capital de {LEGAL.capital}, dont le siège est situé{" "}
          {legalAddress()}, immatriculée sous {LEGAL.rcs}. Contact :{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          .
        </p>
      ),
    },
    {
      title: "3. Produits et nature artistique",
      body: (
        <p>
          {LEGAL.brand} propose des œuvres numériques personnalisées : récit / parchemin narratif,
          œuvre visuelle, voix d'un ancêtre imaginaire, certificat symbolique et, selon l'offre,
          coffrets multiples. Le service relève de la{" "}
          <strong>création artistique assistée par intelligence artificielle</strong>. Il ne
          constitue ni un test ADN, ni une recherche généalogique, ni une prestation divinatoire,
          médicale ou juridique.
        </p>
      ),
    },
    {
      title: "4. Prix et paiement",
      body: (
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises lorsque celles-ci sont
          applicables, et affichés avant validation de la commande (à titre indicatif, l'offre
          Junior est proposée à 9,99 €). Le paiement s'effectue en ligne via le prestataire sécurisé
          Stripe.
          {LEGAL.company} ne conserve aucune donnée bancaire complète. La commande est ferme après
          encaissement complet et confirmation des informations nécessaires à la composition.
        </p>
      ),
    },
    {
      title: "5. Commande et composition",
      body: (
        <p>
          Le client renseigne un questionnaire créatif dont les réponses servent à composer une
          œuvre personnelle. {LEGAL.company} se réserve le droit de refuser ou de suspendre une
          commande en cas d'usage frauduleux, de contenu illicite, de paiement non confirmé ou
          d'impossibilité technique manifeste.
        </p>
      ),
    },
    {
      title: "6. Livraison",
      body: (
        <p>
          Les œuvres sont livrées par voie numérique, par email et depuis l'espace personnel du
          client lorsqu'il est disponible. Le délai cible est d'environ quinze minutes après
          paiement et questionnaire complet (jusqu'à trente minutes pour l'offre Famille). Un retard
          technique exceptionnel n'ouvre droit qu'à une nouvelle composition ou, si la livraison
          devient durablement impossible, à un remboursement.
        </p>
      ),
    },
    {
      title: "7. Droit de rétractation",
      body: (
        <p>
          Les œuvres étant confectionnées selon les indications du client et nettement
          personnalisées, et s'agissant de contenus numériques fournis immédiatement, le client
          <strong> renonce expressément à son droit de rétractation</strong> dès le lancement de la
          composition, conformément à l'article L.221-28 du Code de la consommation. Avant ce
          lancement, le client dispose du délai légal de quatorze jours.
        </p>
      ),
    },
    {
      title: "8. Garanties légales",
      body: (
        <p>
          Le consommateur bénéficie de la garantie légale de conformité (articles L.217-3 et
          suivants du Code de la consommation) et de la garantie contre les vices cachés (articles
          1641 et suivants du Code civil). En cas de fichier manquant, illisible ou de défaut de
          livraison imputable au service, {LEGAL.company} procède à une nouvelle mise à disposition
          ou à un remboursement. Les appréciations subjectives liées au style, au ton ou à
          l'interprétation artistique ne constituent pas, à elles seules, un défaut de conformité.
        </p>
      ),
    },
    {
      title: "9. Propriété intellectuelle",
      body: (
        <p>
          Les textes, visuels, marques, éléments graphiques, méthodes créatives et contenus du site
          demeurent la propriété de {LEGAL.company} ou de ses ayants droit. Le client reçoit un
          droit d'usage strictement personnel sur son œuvre. Toute exploitation commerciale,
          revente, reproduction massive ou republication sans autorisation écrite est interdite.
        </p>
      ),
    },
    {
      title: "10. Données personnelles",
      body: (
        <p>
          Les données de commande et les réponses au questionnaire sont traitées pour composer,
          livrer et suivre l'œuvre. Les modalités détaillées figurent dans notre{" "}
          <a href="/fr/arcanum_privata" className="link-gold">
            Politique de confidentialité
          </a>
          .
        </p>
      ),
    },
    {
      title: "11. Médiation et droit applicable",
      body: (
        <p>
          Les présentes CGV sont régies par le droit français. En cas de litige, le client adresse
          d'abord une réclamation à{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          . À défaut de solution amiable, le consommateur peut recourir gratuitement à un médiateur
          de la consommation : {LEGAL.mediator}, {LEGAL.mediatorAddress},{" "}
          <a href={LEGAL.mediatorUrl} target="_blank" rel="noreferrer" className="link-gold">
            {LEGAL.mediatorUrl.replace(/^https?:\/\//, "")}
          </a>
          , conformément aux articles L.611-1 et suivants du Code de la consommation.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Conditions générales de vente"
      subtitle="Les règles applicables à toute commande sur Totem Ancestral."
      sections={sections}
    />
  );
}
