"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PageHero } from "@/components/PageHero";

type Item = { q: string; a: string };
type Cat = { title: string; items: Item[] };

function AccordionItem({ q, a }: Item) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(201,168,76,0.18)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full py-6 flex items-center justify-between gap-6 text-left group"
      >
        <span className="text-base md:text-lg font-semibold" style={{ color: "var(--ivoire)" }}>
          {q}
        </span>
        <span style={{ color: "var(--or-ancestral)" }} className="shrink-0">
          {open ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
        </span>
      </button>
      {open && (
        <div
          className="pb-6 pr-10 text-[15px] leading-[1.8] animate-fade-in"
          style={{ color: "rgba(254,252,240,0.85)" }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export function FAQPage() {
  const t = useTranslations();

  const categories: Cat[] = [
    {
      title: t("la_nature_de_l_uvre"),
      items: [
        {
          q: t("s_agit_il_d_un_test_adn_ou_genealogique"),
          a: t("non_totem_ancestral_n_est_ni_un_test_adn_ni_un_service_de"),
        },
        {
          q: t("chaque_uvre_est_elle_vraiment_unique"),
          a: t("oui_chaque_coffret_porte_un_numero_une_signature_et_un"),
        },
        {
          q: t("l_ia_remplace_t_elle_l_artiste"),
          a: t("non_nos_directions_artistiques_composent_les_cadres_les"),
        },
      ],
    },
    {
      title: t("l_experience_pratique"),
      items: [
        {
          q: t("combien_de_temps_prend_la_composition"),
          a: t("le_questionnaire_dure_environ_quinze_minutes_l_uvre_est"),
        },
        {
          q: t("sous_quel_format_recoit_on_l_uvre"),
          a: t("vous_recevez_un_parchemin_pdf_une_uvre_visuelle_png_haute"),
        },
        {
          q: t("puis_je_offrir_une_uvre"),
          a: t("absolument_chaque_commande_inclut_une_carte_cadeau_gratuite"),
        },
      ],
    },
    {
      title: t("la_technique"),
      items: [
        {
          q: t("l_uvre_est_elle_imprimable"),
          a: t("oui_l_uvre_visuelle_est_livree_en_tres_haute_resolution"),
        },
        {
          q: t("mes_donnees_sont_elles_protegees"),
          a: t("vos_reponses_sont_utilisees_uniquement_pour_composer_votre"),
        },
      ],
    },
    {
      title: t("la_maison"),
      items: [
        {
          q: t("qui_est_derriere_totem_ancestral"),
          a: t("totem_ancestral_est_une_maison_de_creation_artistique_2"),
        },
        {
          q: t("comment_vous_contacter"),
          a: t("par_email_a_contact_totemancestral_com_ou_via_notre"),
        },
      ],
    },
  ];

  return (
    <>
      <PageHero
        title={t("questions_frequentes")}
        subtitle={t("questions_frequentes_sur_l_experience_totem_ancestral")}
      />
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-3xl mx-auto flex flex-col gap-16">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h2
                className="h-display text-2xl md:text-3xl mb-6 pb-4 border-b"
                style={{ color: "var(--or-pale)", borderColor: "rgba(201,168,76,0.3)" }}
              >
                {cat.title}
              </h2>
              <div>
                {cat.items.map((it) => (
                  <AccordionItem key={it.q} {...it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

