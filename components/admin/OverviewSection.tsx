"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { SectionTitle, StatCard, LoadingState, ErrorState, formatEuroCents } from "./ui";
import type { StatsData } from "./types";

export function OverviewSection() {
  const { t, lang } = useAdminLocale();
  const { data, loading, error } = useAdminFetch<StatsData>("/api/admin/stats");

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle title={t("Vue d'ensemble")} subtitle={t("L'essentiel de l'activité, en un coup d'œil.")} />

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("Commandes totales")} value={String(data.totalCommandes)} />
          <StatCard label={t("Commandes actives")} value={String(data.commandesActives)} />
          <StatCard label={t("Revenu total")} value={formatEuroCents(data.revenuTotal, lang)} />
          <StatCard label={t("En erreur")} value={String(data.erreurs)} tone={data.erreurs > 0 ? "warning" : undefined} />
          <StatCard label={t("Aujourd'hui")} value={String(data.aujourdHui)} />
          <StatCard label={t("Utilisateurs")} value={String(data.totalUtilisateurs)} />
          <StatCard label={t("Œuvres")} value={String(data.totalOeuvres)} />
          <StatCard label={t("Œuvres livrées")} value={String(data.oeuvresLivrees)} />
        </div>
      )}
    </div>
  );
}
