import { LegalLayout, type LegalSection } from "@/components/pages/LegalLayout";
import { LEGAL } from "@/lib/legal";

export function PrivacyPage() {
  const sections: LegalSection[] = [
    {
      title: "1. Responsable du traitement",
      body: (
        <p>
          {LEGAL.company} ({LEGAL.form}) est responsable des traitements de données personnelles
          liés au service {LEGAL.brand}. Pour toute question ou demande d'exercice de vos droits :{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          .
        </p>
      ),
    },
    {
      title: "2. Données collectées",
      body: (
        <p>
          Nous collectons les informations nécessaires à l'expérience : prénom, email, réponses au
          questionnaire, choix d'offre, état de commande, identifiants techniques (session, langue),
          informations de livraison numérique et références de paiement. Les données bancaires
          complètes ne transitent pas par nos serveurs : elles sont traitées directement par Stripe.
        </p>
      ),
    },
    {
      title: "3. Finalités et bases légales",
      body: (
        <p>
          Vos données servent à créer votre compte, composer l'œuvre, générer et livrer les
          fichiers, assurer le support, prévenir la fraude et respecter nos obligations comptables.
          Les traitements reposent sur l'<strong>exécution du contrat</strong> (commande et
          livraison), notre <strong>intérêt légitime</strong> (sécurité et amélioration du service),
          nos <strong>obligations légales</strong> (facturation) et votre{" "}
          <strong>consentement</strong> lorsqu'il est requis.
        </p>
      ),
    },
    {
      title: "4. Destinataires et sous-traitants",
      body: (
        <>
          <p>Seules les données nécessaires sont transmises à chaque prestataire :</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Supabase — authentification, base de données et stockage des fichiers ;</li>
            <li>Stripe — traitement des paiements ;</li>
            <li>Resend — envoi des emails transactionnels ;</li>
            <li>
              Anthropic (Claude) et OpenAI — génération de texte, d'image et de voix assistée par
              IA.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "5. Transferts hors Union européenne",
      body: (
        <p>
          Certains prestataires (hébergement, IA) peuvent traiter des données en dehors de l'Union
          européenne, notamment aux États-Unis. Ces transferts sont encadrés par des garanties
          appropriées au sens du RGPD, telles que les clauses contractuelles types de la Commission
          européenne.
        </p>
      ),
    },
    {
      title: "6. Durées de conservation",
      body: (
        <p>
          Les données de compte et de commande sont conservées le temps de la relation puis
          archivées conformément aux obligations légales (jusqu'à dix ans pour les pièces
          comptables). Les réponses au questionnaire et les fichiers générés sont conservés pour
          permettre le téléchargement et le support, puis supprimés sur demande lorsque la loi le
          permet.
        </p>
      ),
    },
    {
      title: "7. Mineurs (parcours Junior)",
      body: (
        <p>
          Le parcours Junior s'adresse à un public jeune. La création d'un compte et toute commande
          doivent être réalisées par un parent ou un titulaire de l'autorité parentale, qui consent
          au traitement des données de l'enfant. {LEGAL.company} ne collecte pas sciemment de
          données d'un mineur sans ce consentement ; toute demande de suppression peut être adressée
          à {LEGAL.email}.
        </p>
      ),
    },
    {
      title: "8. Sécurité",
      body: (
        <p>
          Les accès sensibles restent côté serveur, les fichiers sont stockés dans des
          environnements sécurisés et les échanges utilisent des connexions chiffrées (HTTPS). Aucun
          dispositif ne garantit toutefois une sécurité absolue sur Internet.
        </p>
      ),
    },
    {
      title: "9. Cookies",
      body: (
        <p>
          Le site utilise uniquement des cookies techniques nécessaires au fonctionnement de
          l'expérience (session, langue, consentement). Aucun cookie publicitaire n'est utilisé.
        </p>
      ),
    },
    {
      title: "10. Vos droits",
      body: (
        <p>
          Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de
          limitation, d'opposition, de portabilité et du droit de définir des directives relatives
          au sort de vos données après votre décès. Vous pouvez retirer votre consentement à tout
          moment. Pour les exercer, écrivez à{" "}
          <a href={`mailto:${LEGAL.email}`} className="link-gold">
            {LEGAL.email}
          </a>
          . Vous pouvez également introduire une réclamation auprès de la CNIL (3 Place de Fontenoy,
          TSA 80715, 75334 Paris Cedex 07 — www.cnil.fr).
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Politique de confidentialité"
      subtitle="Comment Totem Ancestral protège les données liées à votre œuvre."
      sections={sections}
    />
  );
}
