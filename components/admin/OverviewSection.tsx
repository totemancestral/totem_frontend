"use client";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { SectionTitle, StatCard, LoadingState, ErrorState, formatEuroCents } from "./ui";
import type { StatsData } from "./types";

export function OverviewSection() {
  const { data, loading, error } = useAdminFetch<StatsData>("/api/admin/stats");

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle title="Vue d'ensemble" subtitle="L'essentiel de l'activité, en un coup d'œil." />

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Commandes totales" value={String(data.totalCommandes)} />
          <StatCard label="Commandes actives" value={String(data.commandesActives)} />
          <StatCard label="Revenu total" value={formatEuroCents(data.revenuTotal)} />
          <StatCard label="En erreur" value={String(data.erreurs)} tone={data.erreurs > 0 ? "warning" : undefined} />
          <StatCard label="Aujourd'hui" value={String(data.aujourdHui)} />
          <StatCard label="Utilisateurs" value={String(data.totalUtilisateurs)} />
          <StatCard label="Œuvres" value={String(data.totalOeuvres)} />
          <StatCard label="Œuvres livrées" value={String(data.oeuvresLivrees)} />
        </div>
      )}
    </div>
  );
}
