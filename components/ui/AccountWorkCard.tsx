import Link from "next/link";
import type { CommandeRow } from "@/lib/hooks/useCommandes";
import { offreLabel, type OffreType } from "@/lib/offers";
import type { Locale } from "@/app/[lang]/dictionaries";
import styles from "./Account.module.css";

export function AccountWorkCard({ commande, lang, labels, headingLevel = 2 }: {
  commande: CommandeRow; lang: Locale; headingLevel?: 2 | 3;
  labels: { cardLabel: string; audioLabel: string; certificateLabel: string; openButton: string; serial: string };
}) {
  const work = commande.oeuvre;
  if (!work) return null;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return <Link href={`/${lang}/oeuvre?commande=${commande.id}`} className={`${styles.card} ${styles.work}`}>
    <div className={styles.portrait}>
      {work.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- privately signed generated artwork
        <img src={work.image_url} alt="" />
      )}
      <span className={styles.offer}>{offreLabel(commande.offre as OffreType, lang)}</span>
    </div>
    <div className={styles.workBody}>
      <Heading className={styles.cardTitle}>{work.nom_totem || offreLabel(commande.offre as OffreType, lang)}</Heading>
      {work.numero_serie && <p className={styles.reference}>{labels.serial} {work.numero_serie}</p>}
      <div className={styles.tags}>
        {work.pdf_url && <span className={styles.tag}>{labels.cardLabel}</span>}
        {work.audio_url && !["origine", "essentiel", "junior"].includes(commande.offre) && <span className={styles.tag}>{labels.audioLabel}</span>}
        {work.certificate_url && <span className={styles.tag}>{labels.certificateLabel}</span>}
      </div>
      <span className={styles.action}>{labels.openButton}<span aria-hidden="true" className={styles.arrow}>→</span></span>
    </div>
  </Link>;
}
