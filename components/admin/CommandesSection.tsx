"use client";
import { useState } from "react";
import { useAdminFetch, adminPost } from "@/lib/hooks/useAdminFetch";
import {
  SectionTitle,
  FilterBar,
  FilterInput,
  FilterSelect,
  StatusBadge,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  formatEuroCents,
  formatDateShort,
} from "./ui";
import type { CommandeRow, Paginated } from "./types";

const STATUTS = [
  { value: "en_attente_paiement", label: "En attente de paiement" },
  { value: "paye", label: "Payée" },
  { value: "en_generation", label: "En génération" },
  { value: "livree", label: "Livrée" },
  { value: "erreur", label: "Erreur" },
  { value: "remboursee", label: "Remboursée" },
];

const OFFRES = [
  { value: "essentiel", label: "Origine" },
  { value: "signature", label: "Révélation" },
  { value: "heritage", label: "Famille" },
  { value: "junior", label: "Junior" },
];

export function CommandesSection() {
  const [statut, setStatut] = useState("");
  const [offre, setOffre] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [relancingId, setRelancingId] = useState<string | null>(null);
  const [relancingTout, setRelancingTout] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { data, loading, error, reload } = useAdminFetch<Paginated<"commandes", CommandeRow>>(
    "/api/admin/commandes",
    { statut, offre, search, page: String(page) },
  );

  async function relancer(commandeId: string) {
    setRelancingId(commandeId);
    setNotice(null);
    const result = await adminPost("/api/admin/relancer", { commandeId });
    setNotice(result.ok ? "Commande relancée." : "Échec de la relance.");
    setRelancingId(null);
    reload();
  }

  async function relancerTout() {
    setRelancingTout(true);
    setNotice(null);
    const result = await adminPost<{ total?: number }>("/api/admin/relancer-tout");
    setNotice(result.ok ? `Relance lancée sur ${result.data?.total ?? 0} commande(s).` : "Échec de la relance groupée.");
    setRelancingTout(false);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle title="Commandes" subtitle="Toutes les commandes, filtrables et relançables." />
        <button
          onClick={relancerTout}
          disabled={relancingTout}
          className="border border-or px-4 py-2 text-xs uppercase tracking-wide text-or transition-colors hover:bg-or hover:text-nuit disabled:opacity-40"
        >
          {relancingTout ? "…" : "Relancer les commandes bloquées"}
        </button>
      </div>

      <FilterBar>
        <FilterInput label="Recherche" value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Email, session Stripe…" />
        <FilterSelect label="Statut" value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={STATUTS} />
        <FilterSelect label="Offre" value={offre} onChange={(v) => { setOffre(v); setPage(1); }} options={OFFRES} />
      </FilterBar>

      {notice && <p className="text-sm text-orpale">{notice}</p>}

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && data.commandes.length === 0 && <EmptyState text="Aucune commande ne correspond à ces filtres." />}

      {data && data.commandes.length > 0 && (
        <div className="overflow-x-auto border border-ombre">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Offre</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.commandes.map((commande) => (
                <tr key={commande.id} className="border-b border-ombre last:border-b-0">
                  <td className="px-4 py-3 text-ivoire">
                    {commande.client_prenom || "—"}
                    <div className="text-xs text-grisclair">{commande.client_email ?? commande.user_id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{commande.offre}</td>
                  <td className="px-4 py-3 text-ivoire">{formatEuroCents(commande.montant_cents)}</td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(commande.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={commande.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(commande.statut === "erreur" || commande.statut === "en_generation") && (
                      <button
                        onClick={() => relancer(commande.id)}
                        disabled={relancingId === commande.id}
                        className="text-xs uppercase tracking-wide text-or disabled:opacity-40"
                      >
                        {relancingId === commande.id ? "…" : "Relancer"}
                      </button>
                    )}
                  </td>
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
