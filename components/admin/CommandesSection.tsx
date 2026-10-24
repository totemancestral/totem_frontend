"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
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
import { adminOffer } from "@/lib/admin-copy";

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
  const { t, lang } = useAdminLocale();
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
    const result = await adminPost<{ outcome?: string }>("/api/admin/relancer", { commandeId }, lang);
    setNotice(result.retryNotice ?? t(!result.ok ? "Échec de la relance." : result.data?.outcome === "already_done"
      ? "Commande déjà terminée : aucune nouvelle génération." : result.data?.outcome === "already_running"
        ? "Cette commande est déjà prise en charge." : "Demande de reprise acceptée."));
    setRelancingId(null);
    reload();
  }

  async function relancerTout() {
    setRelancingTout(true);
    setNotice(null);
    const result = await adminPost<{ total?: number; accepted?: number; alreadyRunning?: number; alreadyDone?: number; failed?: number; notAttempted?: number }>("/api/admin/relancer-tout", undefined, lang);
    const summary = typeof result.data?.accepted === "number" ? t("Reprises acceptées : {accepted}. Déjà en cours : {running}. Déjà terminées : {done}. Échecs : {failed}. Non tentées : {skipped}.", {
      accepted: result.data.accepted, running: result.data.alreadyRunning ?? 0, done: result.data.alreadyDone ?? 0,
      failed: result.data.failed ?? 0, skipped: result.data.notAttempted ?? 0,
    }) : t(result.ok ? "Demande de reprise acceptée." : "Échec de la relance groupée.");
    setNotice(result.retryNotice ? `${summary} ${result.retryNotice}` : summary);
    setRelancingTout(false);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle title={t("Commandes")} subtitle={t("Toutes les commandes, filtrables et relançables.")} />
        <button type="button"
          onClick={relancerTout}
          disabled={relancingTout}
          className="border border-or px-4 py-2 text-xs uppercase tracking-wide text-or transition-colors hover:bg-or hover:text-nuit disabled:opacity-40"
        >
          {relancingTout ? t("Relance en cours…") : t("Relancer les commandes bloquées")}
        </button>
      </div>

      <FilterBar>
        <FilterInput label={t("Recherche")} value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t("Email, session Stripe…")} />
        <FilterSelect label={t("Statut")} value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={STATUTS} />
        <FilterSelect label={t("Offre")} value={offre} onChange={(v) => { setOffre(v); setPage(1); }} options={OFFRES} />
      </FilterBar>

      {notice && <p role="status" className="text-sm text-orpale">{notice}</p>}

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}

      {data && data.commandes.length === 0 && <EmptyState text={t("Aucune commande ne correspond à ces filtres.")} />}

      {data && data.commandes.length > 0 && (
        <div role="region" aria-label={t("Tableau des commandes — défilement horizontal")} tabIndex={0} className="max-w-full overflow-x-auto border border-ombre">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">{t("Commandes et actions disponibles")}</caption>
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">{t("Client")}</th>
                <th className="px-4 py-3">{t("Offre")}</th>
                <th className="px-4 py-3">{t("Montant")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Statut")}</th>
                <th scope="col" className="px-4 py-3">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.commandes.map((commande) => (
                <tr key={commande.id} className="border-b border-ombre last:border-b-0">
                  <td className="px-4 py-3 text-ivoire">
                    {commande.client_prenom || "—"}
                    <div className="text-xs text-grisclair">{commande.client_email ?? commande.user_id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{adminOffer(lang, commande.offre)}</td>
                  <td className="px-4 py-3 text-ivoire">{formatEuroCents(commande.montant_cents, lang)}</td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(commande.created_at, lang)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={commande.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(commande.statut === "erreur" || commande.statut === "en_generation") && (
                      <button type="button"
                        aria-label={t("Relancer la commande de {customer}", { customer: commande.client_email ?? commande.client_prenom ?? commande.id })}
                        onClick={() => relancer(commande.id)}
                        disabled={relancingId === commande.id}
                        className="text-xs uppercase tracking-wide text-or disabled:opacity-40"
                      >
                        {relancingId === commande.id ? t("Relance en cours…") : t("Relancer")}
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
