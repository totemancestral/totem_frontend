import { useTranslations } from "next-intl";
import { PageHero } from "@/components/PageHero";

export function PrivacyPage() {
  const t = useTranslations();

  const sections = [
    {
      t: t("donnees_collectees"),
      c: t("nous_collectons_uniquement_les_informations_necessaires_a"),
    },
    {
      t: t("finalite"),
      c: t("vos_donnees_servent_exclusivement_a_composer_votre_uvre"),
    },
    {
      t: t("conservation"),
      c: t("vos_reponses_au_questionnaire_sont_conservees_de_maniere"),
    },
    {
      t: t("vos_droits"),
      c: t("conformement_au_rgpd_vous_disposez_d_un_droit_d_acces_de"),
    },
    {
      t: t("cookies"),
      c: t("nous_utilisons_uniquement_des_cookies_techniques"),
    },
  ];

  return (
    <>
      <PageHero
        title={t("politique_de_confidentialite")}
        subtitle={t("comment_totem_ancestral_protege_vos_donnees_personnelles")}
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

