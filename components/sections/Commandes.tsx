"use client";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";
import { formatEuro, offreLabel, type OffreType } from "@/lib/offers";

const STATUS_KEY = {
  en_attente_paiement: "statusPending",
  paye: "statusGenerating",
  en_generation: "statusGenerating",
  livree: "statusDelivered",
  erreur: "statusError",
  remboursee: "statusRefunded",
} as const;

function formatDate(iso: string, lang: Locale) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Commandes({ dict, lang }: { dict: Dictionary["commandes"]; lang: Locale }) {
  const { commandes, error } = useCommandes();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-16">
      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h1>
      </div>

      {!commandes && !error && <p className="mt-9 text-sm text-grisclair">…</p>}
      {error && <p className="mt-9 text-sm text-grisclair">{dict.emptyText}</p>}
      {commandes && commandes.length === 0 && <p className="mt-9 text-sm text-grisclair">{dict.emptyText}</p>}

      {commandes && commandes.length > 0 && (
        <div className="mt-9 flex flex-col border border-ombre">
          {/* en-tête, réservé au bureau */}
          <div className="hidden border-b border-ombre bg-indigo px-6 py-4 text-xs uppercase tracking-wide text-grisclair lg:grid lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <span>N° de commande</span>
            <span>{dict.dateLabel}</span>
            <span>{dict.offerLabel}</span>
            <span className="text-right">{dict.priceLabel}</span>
            <span className="w-24 text-right">&nbsp;</span>
          </div>

          {commandes.map((commande) => {
            const statusKey = STATUS_KEY[commande.statut as keyof typeof STATUS_KEY] ?? "statusPending";
            return (
              <div
                key={commande.id}
                className="flex flex-col gap-2 border-b border-ombre bg-indigo px-6 py-5 last:border-b-0 lg:grid lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-center lg:gap-0"
              >
                <span className="text-sm text-ivoire">{commande.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-sm text-grisclair">{formatDate(commande.created_at, lang)}</span>
                <span className="font-display text-base italic text-orpale">{offreLabel(commande.offre as OffreType)}</span>
                <span className="text-sm text-ivoire lg:text-right">{formatEuro(commande.montant_cents)}</span>
                <span className="w-fit border border-ombre px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-grisclair lg:ml-auto">
                  {dict[statusKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
