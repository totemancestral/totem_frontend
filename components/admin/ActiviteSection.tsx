"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import { SectionTitle, LoadingState, ErrorState, formatEuroCents } from "./ui";
import type { ActivitePoint } from "./types";

type Metric = "commandes" | "revenu" | "inscriptions";

const METRICS: { key: Metric; label: string }[] = [
  { key: "commandes", label: "Commandes" },
  { key: "revenu", label: "Revenu" },
  { key: "inscriptions", label: "Inscriptions" },
];

export function ActiviteSection() {
  const { t, lang } = useAdminLocale();
  const [metric, setMetric] = useState<Metric>("commandes");
  const { data, loading, error } = useAdminFetch<{ serie: ActivitePoint[] }>("/api/admin/activite");

  const serie = data?.serie ?? [];
  const max = Math.max(1, ...serie.map((p) => p[metric]));
  const total = serie.reduce((sum, p) => sum + p[metric], 0);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle title={t("Activité")} subtitle={t("Les 30 derniers jours.")} />

      <div role="group" aria-label={t("Indicateur affiché")} className="flex flex-wrap gap-3">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={metric === m.key}
            onClick={() => setMetric(m.key)}
            className={`border px-3.5 py-1.5 text-xs uppercase tracking-wide ${
              metric === m.key ? "border-or text-or" : "border-ombre text-grisclair"
            }`}
          >
            {t(m.label)}
          </button>
        ))}
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && (
        <div className="border border-ombre bg-indigo p-6">
          <p className="mb-6 text-sm text-grisclair">
            {t("Total sur la période :")}{" "}
            <span className="font-display text-lg italic text-orpale">
              {metric === "revenu" ? formatEuroCents(total, lang) : total}
            </span>
          </p>

          <div className="flex h-40 items-end gap-[3px]">
            {serie.map((point) => {
              const value = point[metric];
              const heightPct = Math.max(2, Math.round((value / max) * 100));
              return (
                <div key={point.date} className="group relative flex-1">
                  <div
                    className="w-full bg-or/70 transition-colors group-hover:bg-or"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap border border-ombre bg-nuit px-2 py-1 text-xs text-ivoire group-hover:block">
                    {point.date} · {metric === "revenu" ? formatEuroCents(value, lang) : value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-grisclair">
            <span>{serie[0]?.date}</span>
            <span>{serie[serie.length - 1]?.date}</span>
          </div>
          <details className="mt-6 text-sm text-ivoire">
            <summary className="cursor-pointer">{t("Consulter les données du graphique")}</summary>
            <div role="region" aria-label={t("Données d’activité — défilement horizontal")} tabIndex={0} className="mt-4 max-w-full overflow-x-auto">
              <table className="w-full text-left">
                <caption className="sr-only">{t("Valeurs quotidiennes de l’indicateur sélectionné")}</caption>
                <thead><tr><th scope="col" className="p-2">{t("Date")}</th><th scope="col" className="p-2">{t(METRICS.find(item => item.key === metric)?.label ?? "")}</th></tr></thead>
                <tbody>{serie.map(point => <tr key={point.date}><th scope="row" className="p-2 font-normal">{point.date}</th><td className="p-2">{metric === "revenu" ? formatEuroCents(point[metric], lang) : point[metric]}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
