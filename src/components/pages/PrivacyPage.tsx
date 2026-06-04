import { PageHero } from "@/components/PageHero";

const sections = [
  {
    t: "Données collectées",
    c: "Nous collectons uniquement les informations nécessaires à la composition de votre œuvre : prénom, email, réponses au questionnaire, informations de paiement (gérées par notre prestataire sécurisé).",
  },
  {
    t: "Finalité",
    c: "Vos données servent exclusivement à composer votre œuvre, vous la livrer et assurer le suivi commercial. Aucune revente, aucun partage marketing.",
  },
  {
    t: "Conservation",
    c: "Vos réponses au questionnaire sont conservées de manière chiffrée pour vous permettre de récupérer votre œuvre. Vous pouvez demander leur suppression à tout moment.",
  },
  {
    t: "Vos droits",
    c: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Écrivez à contact@totemancestral.com.",
  },
  {
    t: "Cookies",
    c: "Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement du site. Aucun cookie publicitaire ni de tracking tiers.",
  },
];

export function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        subtitle="Vos données, comme votre œuvre, vous appartiennent."
      />
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
