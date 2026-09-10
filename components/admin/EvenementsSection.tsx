"use client";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { SectionTitle, StatusBadge, LoadingState, ErrorState, EmptyState, formatDateTime } from "./ui";
import type { ChangementCommande, ErreurPipeline } from "./types";

export function EvenementsSection() {
  const { data, loading, error } = useAdminFetch<{ erreurs: ErreurPipeline[]; changements: ChangementCommande[] }>(
    "/api/admin/evenements",
  );

  return (
    <div className="flex flex-col gap-10">
      <SectionTitle title="Événements" subtitle="Erreurs récentes du pipeline et derniers changements de statut." />

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && (
        <>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-grisclair">Erreurs pipeline (50 dernières)</p>
            {data.erreurs.length === 0 ? (
              <EmptyState text="Aucune erreur récente." />
            ) : (
              <div className="flex flex-col gap-2">
                {data.erreurs.map((erreur) => (
                  <div key={erreur.id} className="border border-ombre p-4" style={{ borderColor: "#4A3030" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide" style={{ color: "#E0A99B" }}>
                        {erreur.etape}
                      </span>
                      <span className="text-xs text-grisclair">{formatDateTime(erreur.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-ivoire">{erreur.message}</p>
                    <p className="mt-1 text-xs text-grisclair">Commande {erreur.commande_id.slice(0, 8)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wide text-grisclair">Derniers changements de statut</p>
            {data.changements.length === 0 ? (
              <EmptyState text="Aucun changement récent." />
            ) : (
              <div className="flex flex-col border border-ombre">
                {data.changements.map((changement) => (
                  <div
                    key={changement.id}
                    className="flex items-center justify-between border-b border-ombre bg-indigo px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <span className="text-sm text-ivoire">{changement.offre}</span>
                      <span className="ml-2 text-xs text-grisclair">{changement.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-grisclair">{formatDateTime(changement.updated_at)}</span>
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
