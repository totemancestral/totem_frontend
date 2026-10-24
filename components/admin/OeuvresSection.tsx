"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks/useAdminFetch";
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
  formatDateShort,
} from "./ui";
import type { OeuvreRow, Paginated } from "./types";
import { adminOffer } from "@/lib/admin-copy";

const STATUTS = [
  { value: "en_generation", label: "En génération" },
  { value: "livree", label: "Livrée" },
  { value: "erreur", label: "Erreur" },
];

const FICHIERS = [
  { value: "complete", label: "Complète (image + audio + PDF)" },
  { value: "incomplete", label: "Incomplète" },
  { value: "image", label: "A une image" },
  { value: "audio", label: "A un audio" },
  { value: "pdf", label: "A un PDF" },
];

export function OeuvresSection() {
  const { t, lang } = useAdminLocale();
  const [statut, setStatut] = useState("");
  const [fichier, setFichier] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error } = useAdminFetch<Paginated<"oeuvres", OeuvreRow>>("/api/admin/oeuvres", {
    statut,
    fichier,
    search,
    page: String(page),
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle title={t("Œuvres")} subtitle={t("Les créations livrées ou en cours de composition.")} />

      <FilterBar>
        <FilterInput label={t("Recherche")} value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t("Nom de totem, numéro de série…")} />
        <FilterSelect label={t("Statut")} value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={STATUTS} />
        <FilterSelect label={t("Fichiers")} value={fichier} onChange={(v) => { setFichier(v); setPage(1); }} options={FICHIERS} />
      </FilterBar>

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}
      {data && data.oeuvres.length === 0 && <EmptyState text={t("Aucune œuvre ne correspond à ces filtres.")} />}

      {data && data.oeuvres.length > 0 && (
        <div role="region" aria-label={t("Tableau des œuvres — défilement horizontal")} tabIndex={0} className="max-w-full overflow-x-auto border border-ombre">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">{t("Œuvres et fichiers disponibles")}</caption>
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">{t("Totem")}</th>
                <th className="px-4 py-3">{t("Client")}</th>
                <th className="px-4 py-3">{t("Offre")}</th>
                <th className="px-4 py-3">{t("Fichiers")}</th>
                <th className="px-4 py-3">{t("Date")}</th>
                <th className="px-4 py-3">{t("Statut")}</th>
              </tr>
            </thead>
            <tbody>
              {data.oeuvres.map((oeuvre) => (
                <tr key={oeuvre.id} className="border-b border-ombre last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-display italic text-ivoire">{oeuvre.nom_totem || "—"}</span>
                    <div className="text-xs text-grisclair">{t("N°")} {oeuvre.numero_serie ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">
                    {oeuvre.client_prenom || "—"}
                    <div className="text-xs">{oeuvre.client_email}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{oeuvre.commande_offre ? adminOffer(lang, oeuvre.commande_offre) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <FileDot ok={Boolean(oeuvre.image_url)} label={t("Image")} />
                      <FileDot ok={Boolean(oeuvre.audio_url)} label={t("Audio")} />
                      <FileDot ok={Boolean(oeuvre.pdf_url)} label={t("PDF")} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(oeuvre.created_at, lang)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={oeuvre.statut} />
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

function FileDot({ ok, label }: { ok: boolean; label: string }) {
  const { t } = useAdminLocale();
  return (
    <span
      role="img"
      aria-label={t(ok ? "{file} : disponible" : "{file} : manquant", { file: label })}
      title={label}
      className="flex h-6 w-6 items-center justify-center border text-[10px] font-semibold uppercase"
      style={{
        borderColor: ok ? "#C9A84C" : "#2D2D1A",
        color: ok ? "#EDD99A" : "#555555",
      }}
    >
      <span aria-hidden="true">{label[0]}</span>
    </span>
  );
}
