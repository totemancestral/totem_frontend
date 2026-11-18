"use client";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCommandes } from "@/lib/hooks/useCommandes";
import { interfaceCopy } from "@/lib/interface-copy";
import { AccountWorkCard } from "@/components/ui/AccountWorkCard";
import styles from "@/components/ui/Account.module.css";

export default function EspaceOeuvres({ dict, lang }: { dict: Dictionary["espaceOeuvres"]; lang: Locale }) {
  const ui = interfaceCopy(lang);
  const { commandes, error, delayNotice } = useCommandes(lang);
  const works = (commandes ?? []).filter((c) => c.oeuvre);

  return (
    <div className={styles.page}>
      <div className="flex flex-col gap-2.5">
        <p className={styles.eyebrow}>{dict.eyebrow}</p>
        <h1 className={styles.title}>{dict.title}</h1>
        <p className={styles.intro}>{dict.intro}</p>
      </div>

      {!commandes && !error && <p role="status" className="mt-9 text-sm text-grisclair">{ui.status.loading}</p>}
      {delayNotice && <p role="alert" className="mt-9 text-sm text-grisclair">{delayNotice}</p>}
      {!delayNotice && (error || (commandes && works.length === 0)) && (
        <p role={error ? "alert" : undefined} className={`${styles.card} ${styles.pad} ${styles.content} ${styles.muted}`}>{error ? ui.errors.orderUnavailable : dict.emptyText}</p>
      )}

      {works.length > 0 && (
        <div className={`${styles.grid} ${styles.content}`}>
          {works.map((commande) => (
            <AccountWorkCard key={commande.id} commande={commande} lang={lang} labels={{ ...dict, serial: ui.orders.serial }} />
          ))}
        </div>
      )}
    </div>
  );
}
