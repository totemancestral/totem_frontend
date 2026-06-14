import { useTranslations } from "next-intl";
import { PageHero } from "@/components/PageHero";

export function MentionsPage() {
  const t = useTranslations();

  return (
    <>
      <PageHero title={t("mentions_legales")} />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <article
          className="max-w-2xl mx-auto space-y-6 text-[15px] leading-[1.85]"
          style={{ color: "var(--ivoire)" }}
        >
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
              {t("editeur")}
            </h2>
            <p>
              {t("senyce_partners_maison_de_creation_artistique")}
              <br />
              {t("siege_social_paris_france")}
              <br />
              {t("contact_2")}{" "}
              <a href="mailto:contact@totemancestral.com" className="link-gold">
                {t("contact_totemancestral_com")}
              </a>
            </p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
              {t("directeur_de_la_publication")}
            </h2>
            <p>{t("senyce_partners_2")}</p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
              {t("hebergement")}
            </h2>
            <p>
              {t("le_site_est_heberge_sur_une_infrastructure_cloud_securisee")}
            </p>
          </div>
          <div>
            <h2 className="h-display text-2xl mb-3" style={{ color: "var(--or-ancestral)" }}>
              {t("propriete_intellectuelle")}
            </h2>
            <p>
              {t("l_ensemble_des_contenus_presents_sur_ce_site_textes_visuels")}
            </p>
          </div>
        </article>
      </section>
    </>
  );
}

