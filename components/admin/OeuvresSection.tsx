"use client";
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
      <SectionTitle title="Œuvres" subtitle="Les créations livrées ou en cours de composition." />

      <FilterBar>
        <FilterInput label="Recherche" value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Nom de totem, numéro de série…" />
        <FilterSelect label="Statut" value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={STATUTS} />
        <FilterSelect label="Fichiers" value={fichier} onChange={(v) => { setFichier(v); setPage(1); }} options={FICHIERS} />
      </FilterBar>

      {loading && <LoadingState />}
      {error && <ErrorState text={error} />}
      {data && data.oeuvres.length === 0 && <EmptyState text="Aucune œuvre ne correspond à ces filtres." />}

      {data && data.oeuvres.length > 0 && (
        <div className="overflow-x-auto border border-ombre">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ombre bg-indigo text-xs uppercase tracking-wide text-grisclair">
              <tr>
                <th className="px-4 py-3">Totem</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Offre</th>
                <th className="px-4 py-3">Fichiers</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.oeuvres.map((oeuvre) => (
                <tr key={oeuvre.id} className="border-b border-ombre last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-display italic text-ivoire">{oeuvre.nom_totem || "—"}</span>
                    <div className="text-xs text-grisclair">N° {oeuvre.numero_serie ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">
                    {oeuvre.client_prenom || "—"}
                    <div className="text-xs">{oeuvre.client_email}</div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{oeuvre.commande_offre ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <FileDot ok={Boolean(oeuvre.image_url)} label="Image" />
                      <FileDot ok={Boolean(oeuvre.audio_url)} label="Audio" />
                      <FileDot ok={Boolean(oeuvre.pdf_url)} label="PDF" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-grisclair">{formatDateShort(oeuvre.created_at)}</td>
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
  return (
    <span
      role="img"
      aria-label={`${label} : ${ok ? "disponible" : "manquant"}`}
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
