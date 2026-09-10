"use client";
import type { ReactNode } from "react";

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-display text-2xl text-ivoire lg:text-3xl">{title}</h2>
      {subtitle && <p className="text-sm text-grisclair">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="flex flex-col gap-2 border border-ombre bg-indigo p-5">
      <span className="text-xs uppercase tracking-wide text-grisclair">{label}</span>
      <span
        className="font-display text-3xl"
        style={{ color: tone === "warning" ? "#C97B4C" : "#EDD99A" }}
      >
        {value}
      </span>
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

export function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-grisclair">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-ombre bg-indigo px-3 py-2 text-sm text-ivoire placeholder:text-grisclair"
      />
    </label>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-grisclair">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-ombre bg-indigo px-3 py-2 text-sm text-ivoire"
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const STATUT_STYLES: Record<string, string> = {
  livree: "border-[#6B9B6E] text-[#8FC492]",
  paye: "border-or text-or",
  en_generation: "border-[#C9A84C] text-[#C9A84C]",
  en_attente_paiement: "border-ombre text-grisclair",
  erreur: "border-[#C97B6B] text-[#E0A99B]",
  remboursee: "border-ombre text-grisclair",
};

export function StatusBadge({ statut }: { statut: string }) {
  const style = STATUT_STYLES[statut] ?? "border-ombre text-grisclair";
  return (
    <span className={`w-fit border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style}`}>
      {statut.replace(/_/g, " ")}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-ombre pt-4 text-sm text-grisclair">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="uppercase tracking-wide disabled:opacity-30"
      >
        Précédent
      </button>
      <span>
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="uppercase tracking-wide disabled:opacity-30"
      >
        Suivant
      </button>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-grisclair">{text}</p>;
}

export function LoadingState() {
  return <p className="py-10 text-center text-sm text-grisclair">Chargement…</p>;
}

export function ErrorState({ text }: { text: string }) {
  return (
    <p className="py-10 text-center text-sm" style={{ color: "#E0A99B" }}>
      {text}
    </p>
  );
}

export function formatEuroCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
