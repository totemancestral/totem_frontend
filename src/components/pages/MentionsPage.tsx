import { LegalLayout, type LegalSection } from "@/components/pages/LegalLayout";
import { LEGAL, legalAddress } from "@/lib/legal";

export function MentionsPage() {
  const sections: LegalSection[] = [
    {
      title: "1. Éditeur du site",
      body: (
        <>
          <p>
            Le site <strong>{LEGAL.brand}</strong> ({LEGAL.domain}) est édité par :
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>{LEGAL.company}</strong>, {LEGAL.form} au capital de {LEGAL.capital}
            </li>
            <li>Siège social : {legalAddress()}</li>
            <li>Immatriculation : {LEGAL.rcs}</li>
            <li>TVA intracommunautaire : {LEGAL.tva}</li>
            <li>
              Contact :{" "}
              <a href={`mailto:${LEGAL.email}`} className="link-gold">
                {LEGAL.email}
              </a>
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "2. Directeur de la publication",
      body: (
        <p>
          {LEGAL.director}, représentant légal de {LEGAL.company}.
        </p>
      ),
    },
    {
      title: "3. Hébergement",
      body: (
        <>
          <p>Le service repose sur les prestataires d'hébergement suivants :</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Application web</strong> — Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
              91789, États-Unis.
            </li>
            <li>
              <strong>Services applicatifs (API)</strong> — Render (Render, Inc.), 525 Brannan St,
              Suite 300, San Francisco, CA 94107, États-Unis.
            </li>
            <li>
              <strong>Base de données, authentification et stockage des fichiers</strong> —
              Supabase, Inc., 970 Toa Payoh North, Singapour.
            </li>
          </ul>
          <p className="premium-soft">
            Ces prestataires peuvent héberger des données hors de l'Union européenne. Voir la
            Politique de confidentialité pour les garanties encadrant ces transferts.
          </p>
        </>
      ),
    },
    {
      title: "4. Propriété intellectuelle",
      body: (
        <p>
          L'ensemble des contenus présents sur ce site — textes, visuels, identité de marque,
          interface, parcours, formulations, prompts, fichiers générés, charte graphique et signes
          distinctifs — est protégé par le droit de la propriété intellectuelle et demeure la
          propriété de {LEGAL.company} ou de ses ayants droit. Toute reproduction, extraction,
          diffusion, revente ou exploitation commerciale non autorisée est interdite. Le client
          bénéficie d'un droit d'usage personnel sur l'œuvre qu'il a commandée.
        </p>
      ),
    },
    {
      title: "5. Nature du service",
      body: (
        <p>
          {LEGAL.brand} est une œuvre de fiction artistique personnalisée, inspirée des cosmogonies
          africaines et assistée par intelligence artificielle. Le service ne constitue pas un test
          ADN, une vérité généalogique, un diagnostic, ni un conseil juridique, médical ou
          spirituel.
        </p>
      ),
    },
    {
      title: "6. Données personnelles & cookies",
      body: (
        <p>
          Le traitement des données personnelles et l'usage des cookies sont détaillés dans notre{" "}
          <a href="/fr/arcanum_privata" className="link-gold">
            Politique de confidentialité
          </a>
          . Pour toute demande relative à vos données, écrivez à{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          .
        </p>
      ),
    },
    {
      title: "7. Médiation de la consommation",
      body: (
        <p>
          Conformément aux articles L.611-1 et suivants du Code de la consommation, le client
          consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la
          résolution amiable d'un litige. Médiateur compétent : {LEGAL.mediator}. Une réclamation
          préalable doit être adressée à {LEGAL.email} avant toute saisine.
        </p>
      ),
    },
    {
      title: "8. Signalement & contact",
      body: (
        <p>
          Pour signaler un contenu, une difficulté de livraison, une question de droits ou une
          demande relative aux données personnelles, écrivez à{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Mentions légales"
      subtitle="Informations relatives à l'éditeur et au service Totem Ancestral."
      sections={sections}
    />
  );
}
