"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { SectionTitle, StatusBadge, LoadingState, ErrorState, EmptyState, formatDateTime } from "./ui";
import type { ChangementCommande, ErreurPipeline } from "./types";
import { adminOffer } from "@/lib/admin-copy";

export function EvenementsSection() {
  const { t, lang } = useAdminLocale();
  const { data, loading, error } = useAdminFetch<{ erreurs: ErreurPipeline[]; changements: ChangementCommande[] }>(
    "/api/admin/evenements",
  );

  return (
    <div className="flex flex-col gap-10">
      <SectionTitle title={t("Événements")} subtitle={t("Erreurs récentes du pipeline et derniers changements de statut.")} />

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && (
        <>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-grisclair">{t("Erreurs pipeline (50 dernières)")}</p>
            {data.erreurs.length === 0 ? (
              <EmptyState text={t("Aucune erreur récente.")} />
            ) : (
              <div className="flex flex-col gap-2">
                {data.erreurs.map((erreur) => (
                  <div key={erreur.id} className="border border-ombre p-4" style={{ borderColor: "#4A3030" }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wide" style={{ color: "#E0A99B" }}>
                        {erreur.etape}
                      </span>
                      <span className="text-xs text-grisclair">{formatDateTime(erreur.created_at, lang)}</span>
                    </div>
                    <p className="mt-2 text-sm text-ivoire [overflow-wrap:anywhere]">{erreur.message}</p>
                    <p className="mt-1 text-xs text-grisclair">{t("Commande") + " "}{erreur.commande_id.slice(0, 8)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-grisclair">{t("Derniers changements de statut")}</p>
            {data.changements.length === 0 ? (
              <EmptyState text={t("Aucun changement récent.")} />
            ) : (
              <div className="flex flex-col border border-ombre">
                {data.changements.map((changement) => (
                  <div
                    key={changement.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-ombre bg-indigo px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <span className="text-sm text-ivoire">{adminOffer(lang, changement.offre)}</span>
                      <span className="ml-2 text-xs text-grisclair">{changement.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-xs text-grisclair">{formatDateTime(changement.updated_at, lang)}</span>
                      <StatusBadge statut={changement.statut} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
