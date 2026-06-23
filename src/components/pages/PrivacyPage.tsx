import { PageHero } from "@/components/PageHero";

export function PrivacyPage() {
  const sections = [
    {
      title: "Responsable du traitement",
      body: "SENYCE PARTNERS est responsable des traitements liés au service Totem Ancestral. Pour toute demande : contact@totemancestral.com.",
    },
    {
      title: "Données collectées",
      body: "Nous collectons les informations nécessaires à l'expérience : prénom, email, réponses au questionnaire, choix d'offre, état de commande, identifiants techniques, informations de livraison numérique et références de paiement. Les données bancaires complètes ne transitent pas par nos serveurs.",
    },
    {
      title: "Finalités",
      body: "Ces données servent à créer votre compte, composer l'œuvre, générer les fichiers, livrer le coffret, assurer le support, prévenir la fraude, respecter nos obligations comptables et améliorer la fiabilité du service.",
    },
    {
      title: "Bases légales",
      body: "Les traitements reposent sur l'exécution du contrat pour la commande et la livraison, sur notre intérêt légitime pour la sécurité et l'amélioration du service, sur nos obligations légales pour la facturation, et sur votre consentement lorsque celui-ci est requis.",
    },
    {
      title: "Prestataires",
      body: "Le service peut s'appuyer sur Supabase pour l'authentification et la base de données, Stripe pour le paiement, Brevo pour les emails, Cloudflare R2 pour le stockage de fichiers, OpenAI ou les APIs SENYCE pour la génération assistée par IA. Seules les données nécessaires sont transmises à chaque prestataire.",
    },
    {
      title: "Conservation",
      body: "Les données de compte et de commande sont conservées le temps nécessaire au suivi commercial et aux obligations légales. Les réponses au questionnaire et fichiers générés peuvent être conservés pour permettre le téléchargement, la récupération du coffret et le support, sauf demande de suppression lorsque la loi le permet.",
    },
    {
      title: "Sécurité",
      body: "Les accès sensibles restent côté serveur. Les fichiers sont stockés dans des environnements sécurisés et les échanges utilisent des connexions chiffrées. Aucun dispositif ne garantit toutefois une sécurité absolue sur Internet.",
    },
    {
      title: "Cookies",
      body: "Le site utilise des cookies techniques nécessaires au fonctionnement de l'expérience, de la langue, de la session et du consentement. Aucun cookie publicitaire n'est nécessaire au service.",
    },
    {
      title: "Vos droits",
      body: "Conformément au RGPD, vous pouvez demander l'accès, la rectification, l'effacement, la limitation, l'opposition ou la portabilité de vos données. Écrivez à contact@totemancestral.com. Vous pouvez également saisir l'autorité de contrôle compétente.",
    },
  ];

  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        subtitle="Comment Totem Ancestral protège les données liées à votre œuvre. Dernière mise à jour : 18 juin 2026."
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
