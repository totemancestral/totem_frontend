"use client";
import { MaskLoader } from "@/components/ui/MaskLoader";
import { Button } from "@/components/ui/Button";
import { useCaurisState } from "@/lib/hooks/useCaurisState";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import styles from "@/components/ui/Account.module.css";

export function ConsultationStatus({ copy, lang, className = "", showComposeAction = true }: { copy: Dictionary["cauris"]; lang: Locale; className?: string; showComposeAction?: boolean }) {
  const { state, error, retry, delayNotice } = useCaurisState();
  if (state?.reason === "junior_forbidden") return <div className={`${styles.card} ${styles.pad} ${styles.consultation} ${className}`}><p className={styles.consultationTitle} role="status">{copy.juniorUnavailable}</p></div>;
  return <div className={`${styles.card} ${styles.pad} ${styles.consultation} ${styles.consultationBody} ${className}`}>
    <div className="flex min-w-0 flex-col gap-2" aria-live="polite">
      <span className="text-xs uppercase tracking-wide text-or">{copy.thisWeek}</span>
      {state?.accessible && !state.currentReading && <div aria-hidden="true" className={styles.shells}>{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>}
      {!state && !error ? <MaskLoader label={copy.loading} /> : <p className={styles.consultationTitle}>{error ? delayNotice ?? copy.loadError : !state ? copy.loading : state.currentReading ? copy.alreadyDrawn : state.accessible ? copy.available : state.reason === "serie_indisponible" ? copy.seriesUnavailable : copy.workRequired}</p>}
      {state?.nextAvailableAt && <p className="text-sm text-grisclair">{copy.seeYouNextWeek}</p>}
    </div>
    {error ? <Button variant="account" className={styles.action} onClick={retry}>{copy.retry}</Button> : state?.currentReading ? <Button variant="accountOutline" className={`${styles.action} ${styles.outline}`} href={`/${lang}/consultation-tirage`}>{copy.viewReading}<span aria-hidden="true" className={styles.arrow}>→</span></Button> : state?.accessible ? <Button variant="account" className={styles.action} href={`/${lang}/consultation-question`}>{copy.draw}<span aria-hidden="true" className={styles.arrow}>→</span></Button> : state?.reason === "oeuvre_required" && showComposeAction ? <Button variant="account" className={styles.action} href={`/${lang}/offres`}>{copy.compose}</Button> : null}
  </div>;
}
