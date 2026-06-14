import { useTranslations } from "next-intl";
import { PageHero } from "@/components/PageHero";
import { SectionDivider } from "@/components/Reveal";

export function AboutPage() {
  const t = useTranslations();

  return (
    <>
      <PageHero title={t("la_maison")} subtitle={t("le_manifeste_de_la_maison_totem_ancestral")} />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <article
          className="max-w-2xl mx-auto space-y-8 text-base md:text-lg leading-[1.9]"
          style={{ color: "var(--ivoire)" }}
        >
          <p>
            {t("totem_ancestral_est_une_maison_de_creation_artistique")}
          </p>

          <SectionDivider />

          <h2 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
            {t("ce_que_nous_croyons")}
          </h2>
          <p>
            {t("nous_croyons_que_chaque_etre_humain_merite_une_histoire_qui")}
          </p>
          <p>
            {t("nous_croyons_que_l_intelligence_artificielle_mise_au")}
          </p>

          <h2 className="h-display text-3xl mt-12" style={{ color: "var(--or-ancestral)" }}>
            {t("ce_que_nous_ne_faisons_pas")}
          </h2>
          <p>
            {t("nous_ne_faisons_pas_de_la_science_pas_de_la_genealogie_pas")}
          </p>
          <p>
            {t("nous_faisons_des_uvres_pour_celebrer_un_proche_pour_s")}
          </p>

          <h2 className="h-display text-3xl mt-12" style={{ color: "var(--or-ancestral)" }}>
            {t("notre_exigence")}
          </h2>
          <p>
            {t("chaque_uvre_porte_un_numero_une_signature_un_certificat")}
          </p>
          <p>
            {t("notre_standard_de_reference_est_celui_des_maisons_de")}
          </p>

          <SectionDivider />

          <p className="quote-italic text-xl md:text-2xl text-center">
            {t("nbsp_une_uvre_n_est_jamais_finie_elle_est_seulement")}
          </p>
        </article>
      </section>
    </>
  );
}
