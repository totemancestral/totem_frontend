import { useTranslations } from "next-intl";
import { PageHero } from "@/components/PageHero";

export function CGVPage() {
  const t = useTranslations();

  const sections = [
    {
      t: t("1_objet"),
      c: t("les_presentes_conditions_regissent_la_vente_des_uvres"),
    },
    {
      t: t("2_produits"),
      c: t("trois_offres_totem_origine_49_totem_ancestral_89_totem"),
    },
    {
      t: t("3_commande"),
      c: t("la_commande_est_validee_apres_reception_du_paiement"),
    },
    {
      t: t("4_livraison"),
      c: t("l_uvre_est_livree_par_email_sous_quinze_minutes_trente"),
    },
    {
      t: t("5_droit_de_retractation"),
      c: t("s_agissant_d_une_uvre_numerique_personnalisee_composee_a"),
    },
    {
      t: t("6_garanties"),
      c: t("si_une_difficulte_technique_empeche_la_livraison_l_uvre_est"),
    },
    {
      t: t("7_litiges"),
      c: t("les_presentes_conditions_sont_regies_par_le_droit_francais"),
    },
  ];

  return (
    <>
      <PageHero title={t("conditions_generales_de_vente")} />
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

