"use client";
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
      <SectionTitle title="Utilisateurs" subtitle="Les comptes créés sur le site." />

      <FilterBar>
        <FilterInput label="Recherche" value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Email, prénom…" />
        <FilterSelect label="Langue" value={langue} onChange={(v) => { setLangue(v); setPage(1); }} options={LANGUES} />
        <FilterSelect label="Activité" value={activite} onChange={(v) => { setActivite(v); setPage(1); }} options={ACTIVITES} />
      </FilterBar>

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}
      {data && data.utilisateurs.length === 0 && <EmptyState text="Aucun utilisateur ne correspond à ces filtres." />}

      {data && data.utilisateurs.length > 0 && (
        <div className="overflow-x-auto border border-ombre">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Langue</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Inscrit le</th>
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
                      <span className="ml-1.5 text-xs text-or">({utilisateur.commandes_actives} active{utilisateur.commandes_actives > 1 ? "s" : ""})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(utilisateur.created_at)}</td>
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
