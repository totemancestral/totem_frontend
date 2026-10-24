"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
import {
  SectionTitle,
  FilterBar,
  FilterInput,
  FilterSelect,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  formatDateShort,
} from "./ui";
import type { UtilisateurRow, Paginated } from "./types";

const LANGUES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const ACTIVITES = [
  { value: "avec_commandes", label: "Avec commande(s)" },
  { value: "sans_commandes", label: "Sans commande" },
  { value: "actifs", label: "Commande active en cours" },
];

export function UtilisateursSection() {
  const { t, lang } = useAdminLocale();
  const [search, setSearch] = useState("");
  const [langue, setLangue] = useState("");
  const [activite, setActivite] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error } = useAdminFetch<Paginated<"utilisateurs", UtilisateurRow>>(
    "/api/admin/utilisateurs",
    { search, langue, activite, page: String(page) },
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle title={t("Utilisateurs")} subtitle={t("Les comptes créés sur le site.")} />

      <FilterBar>
        <FilterInput label={t("Recherche")} value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t("Email, prénom…")} />
        <FilterSelect label={t("Langue")} value={langue} onChange={(v) => { setLangue(v); setPage(1); }} options={LANGUES} />
        <FilterSelect label={t("Activité")} value={activite} onChange={(v) => { setActivite(v); setPage(1); }} options={ACTIVITES} />
      </FilterBar>

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}
      {data && data.utilisateurs.length === 0 && <EmptyState text={t("Aucun utilisateur ne correspond à ces filtres.")} />}

      {data && data.utilisateurs.length > 0 && (
        <div role="region" aria-label={t("Tableau des utilisateurs — défilement horizontal")} tabIndex={0} className="max-w-full overflow-x-auto border border-ombre">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">{t("Utilisateurs et nombre de commandes")}</caption>
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">{t("Nom")}</th>
                <th className="px-4 py-3">{t("Email")}</th>
                <th className="px-4 py-3">{t("Langue")}</th>
                <th className="px-4 py-3">{t("Commandes")}</th>
                <th className="px-4 py-3">{t("Inscrit le")}</th>
              </tr>
            </thead>
            <tbody>
              {data.utilisateurs.map((utilisateur) => (
                <tr key={utilisateur.id} className="border-b border-ombre last:border-b-0">
                  <td className="px-4 py-3 text-ivoire">
                    {[utilisateur.prenom, utilisateur.nom].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-grisclair">{utilisateur.email ?? "—"}</td>
                  <td className="px-4 py-3 text-grisclair uppercase">{utilisateur.langue}</td>
                  <td className="px-4 py-3 text-grisclair">
                    {utilisateur.total_commandes}
                    {utilisateur.commandes_actives > 0 && (
                      <span className="ml-1.5 text-xs text-or">({lang === "fr" ? `${utilisateur.commandes_actives} active${utilisateur.commandes_actives > 1 ? "s" : ""}` : t("{count} active(s)", { count: utilisateur.commandes_actives })})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(utilisateur.created_at, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
}
