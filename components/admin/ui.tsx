"use client";
import { useAdminLocale } from "@/lib/hooks/useAdminLocale";
import { adminStatus } from "@/lib/admin-copy";
import type { ReactNode } from "react";

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 tabIndex={-1} className="font-display text-2xl text-ivoire focus:outline-2 focus:outline-offset-4 focus:outline-or lg:text-3xl">{title}</h1>
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
    <label className="flex min-w-0 max-w-full flex-col gap-1.5">
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
  const { t } = useAdminLocale();
  return (
    <label className="flex min-w-0 max-w-full flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-grisclair">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-ombre bg-indigo px-3 py-2 text-sm text-ivoire"
      >
        <option value="">{t("Tous")}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
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
  const { lang } = useAdminLocale();
  const style = STATUT_STYLES[statut] ?? "border-ombre text-grisclair";
  return (
    <span className={`w-fit border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style}`}>
      {adminStatus(lang, statut)}
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
  const { t } = useAdminLocale();
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={t("Pagination")} className="flex flex-wrap items-center justify-between gap-4 border-t border-ombre pt-4 text-sm text-grisclair">
      <button type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="uppercase tracking-wide disabled:opacity-30"
      >
        {t("Précédent")}</button>
      <span role="status">
        {t("Page")} {page} / {totalPages}
      </span>
      <button type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="uppercase tracking-wide disabled:opacity-30"
      >
        {t("Suivant")}</button>
    </nav>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-grisclair">{text}</p>;
}

export function LoadingState() {
  const { t } = useAdminLocale();
  return <p role="status" className="py-10 text-center text-sm text-grisclair">{t("Chargement…")}</p>;
}

export function ErrorState({ text }: { text: string }) {
  return (
    <p role="alert" className="py-10 text-center text-sm" style={{ color: "#E0A99B" }}>
      {text}
    </p>
  );
}

export function formatEuroCents(cents: number, lang: string = "fr"): string {
  return (cents / 100).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR" });
}

export function formatDateShort(iso: string, lang: string = "fr"): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string, lang: string = "fr"): string {
  try {
    return new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
