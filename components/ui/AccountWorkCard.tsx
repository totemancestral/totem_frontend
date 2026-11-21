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
  const oeuvreHref = `/${lang}/oeuvre?commande=${commande.id}`;
  return <article className={`${styles.card} ${styles.work}`}>
    <Link href={oeuvreHref} className={styles.portrait} aria-label={`${labels.openButton} : ${work.nom_totem || offreLabel(commande.offre as OffreType, lang)}`}>
      {work.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- privately signed generated artwork
        <img src={work.image_url} alt="" />
      )}
      <span className={styles.offer}>{offreLabel(commande.offre as OffreType, lang)}</span>
    </Link>
    <div className={styles.workBody}>
      <Heading className={styles.cardTitle}><Link href={oeuvreHref}>{work.nom_totem || offreLabel(commande.offre as OffreType, lang)}</Link></Heading>
      {work.numero_serie && <p className={styles.reference}>{labels.serial} {work.numero_serie}</p>}
      <div className={styles.tags}>
        {work.pdf_url && <a href={work.pdf_url} target="_blank" rel="noopener noreferrer" className={styles.tag}>{labels.cardLabel}</a>}
        {work.audio_url && !["origine", "essentiel", "junior"].includes(commande.offre) && <a href={work.audio_url} target="_blank" rel="noopener noreferrer" className={styles.tag}>{labels.audioLabel}</a>}
        {work.certificate_url && <a href={work.certificate_url} target="_blank" rel="noopener noreferrer" className={styles.tag}>{labels.certificateLabel}</a>}
      </div>
      <Link href={oeuvreHref} className={styles.action}>{labels.openButton}<span aria-hidden="true" className={styles.arrow}>→</span></Link>
    </div>
  </article>;
}
