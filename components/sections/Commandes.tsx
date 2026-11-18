"use client";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";
import { interfaceCopy } from "@/lib/interface-copy";
import { Button } from "@/components/ui/Button";
import styles from "@/components/ui/Account.module.css";
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
  const ui = interfaceCopy(lang);
  const { commandes, error, delayNotice } = useCommandes(lang);

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>{dict.eyebrow}</p>
        <h1 className={styles.title}>{dict.title}</h1>
        <p className={styles.intro}>{dict.intro}</p>
      </header>
      {!commandes && !error && <p role="status" className={`${styles.content} ${styles.muted}`}>{ui.status.loading}</p>}
      {error && <p role="alert" className={`${styles.card} ${styles.pad} ${styles.content} ${styles.muted}`}>{delayNotice ?? ui.errors.orderUnavailable}</p>}
      {commandes?.length === 0 && <p className={`${styles.card} ${styles.pad} ${styles.content} ${styles.muted}`}>{dict.emptyText}</p>}
      {commandes && commandes.length > 0 && <div className={`${styles.grid} ${styles.orderGrid} ${styles.content}`}>
        {commandes.map(commande => {
          const statusKey = STATUS_KEY[commande.statut as keyof typeof STATUS_KEY] ?? "statusPending";
          const resume = commande.requiresQuestionnaire && commande.stripe_session_id;
          const statusStyle = commande.statut === "livree" ? styles.delivered : commande.statut === "erreur" ? styles.error : "";
          return <article key={commande.id} className={`${styles.card} ${styles.pad}`} aria-label={`${dict.detailsTitle} ${commande.id.slice(0, 8).toUpperCase()}`}>
            <div className={styles.row}>
              <span className={styles.reference}>{ui.orders.number} {commande.id.slice(0, 8).toUpperCase()}</span>
              <span className={`${styles.status} ${statusStyle}`}>{dict[statusKey]}</span>
            </div>
            <div className={`${styles.row} ${styles.orderHeading}`}>
              <h2 className={styles.cardTitle}>{offreLabel(commande.offre as OffreType, lang)}</h2>
              <span className={styles.price}>{formatEuro(commande.montant_cents, lang)}</span>
            </div>
            <div className={styles.divider} />
            <dl className={styles.details}>
              <div><dt className={styles.label}>{dict.dateLabel}</dt><dd><time dateTime={commande.created_at}>{formatDate(commande.created_at, lang)}</time></dd></div>
              <div><dt className={styles.label}>{dict.offerLabel}</dt><dd>{offreLabel(commande.offre as OffreType, lang)}</dd></div>
            </dl>
            {(resume || commande.oeuvre) && <div className="mt-6">
              {resume ? <Button variant="account" className={styles.action} href={`/${lang}/parcours?session_id=${encodeURIComponent(commande.stripe_session_id!)}`}>
                {dict.resumeQuestionnaire}<span aria-hidden="true" className={styles.arrow}>→</span>
              </Button> : <Button variant="accountOutline" className={`${styles.action} ${styles.outline}`} href={`/${lang}/oeuvre?commande=${commande.id}`}>
                {dict.viewWork}<span aria-hidden="true" className={styles.arrow}>→</span>
              </Button>}
            </div>}
          </article>;
        })}
      </div>}
    </div>
  );
}
