"use client";
import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { useCanComposeTotem } from "@/lib/hooks/useCanComposeTotem";
import { useTotemJourney } from "@/lib/hooks/useTotemJourney";
import styles from "./Espace.module.css";
import { AccountWorkCard } from "@/components/ui/AccountWorkCard";
import accountStyles from "@/components/ui/Account.module.css";
import { useCommandes } from "@/lib/hooks/useCommandes";
import { interfaceCopy } from "@/lib/interface-copy";
import { ConsultationStatus } from "@/components/sections/ConsultationStatus";

type Props = {
  dict: Dictionary["espace"];
  lang: Locale;
  caurisCopy: Dictionary["cauris"];
};

export default function Espace({ dict, caurisCopy, lang }: Props) {
  const ui = interfaceCopy(lang);
  const canCompose = useCanComposeTotem();
  const { commandes, error, delayNotice } = useCommandes(lang);
  const works = (commandes ?? []).filter((c) => c.oeuvre);
  const unfinished = (commandes ?? []).find((c) => c.requiresQuestionnaire && c.stripe_session_id);

  const waitingForWork = (commandes ?? []).some((commande) =>
    ["paye", "en_generation", "livree", "erreur"].includes(commande.statut) && !commande.requiresQuestionnaire,
  );
  const canContinue = canCompose === true && commandes !== null && !error && works.length === 0 && !waitingForWork;
  const { journey, error: journeyError, retry } = useTotemJourney(lang, canContinue && !unfinished);
  const action = canContinue ? unfinished
    ? { href: `/${lang}/parcours?session_id=${encodeURIComponent(unfinished.stripe_session_id!)}`, resuming: true }
    : journey : null;

  return (
    <div className={styles.dashboard}>
      <header>
        <h1 className={styles.heading}>{dict.eyebrow}</h1>
        <p className={styles.subtitle}>{dict.title}</p>
        <p className={styles.intro}>{dict.intro}</p>
      </header>

      <div className={styles.stats}>
        <Link href={`/${lang}/oeuvres`} className={styles.stat}>
          <span className={styles.statLabel}>{dict.worksCardLabel}</span>
          <span className={styles.statValue}>{commandes === null ? "\u2014" : works.length}</span>
        </Link>
        <Link href={`/${lang}/commandes`} className={styles.stat}>
          <span className={styles.statLabel}>{dict.ordersCardLabel}</span>
          <span className={styles.statValue}>{commandes === null ? "\u2014" : commandes.length}</span>
        </Link>
      </div>

      {action && (
        <section className={styles.journey} aria-labelledby="journey-title">
          <div aria-hidden="true" className={styles.ornament}>
            <span className="block h-8 rounded-b-full border-2 border-current" />
            <span className="mx-auto -mt-8 block h-6 w-6 rounded-b-full border-2 border-current" />
            <span className="mx-auto -mt-6 block h-4 w-3 rounded-b-full border-2 border-current" />
            <span className="mx-auto mt-8 block h-3 w-3 rotate-45 border-2 border-current" />
            <span className="mx-auto mt-4 block h-3 w-3 rotate-45 border-l-2 border-t-2 border-current" />
            <span className="mx-auto block h-3 w-3 rotate-45 border-l-2 border-t-2 border-current" />
          </div>
          <h2 id="journey-title" className={styles.journeyTitle}>
            {action.resuming ? dict.resumeTitle : dict.composeTitle}
          </h2>
          <p className={styles.journeyCopy}>
            {unfinished ? dict.resumePaidText : action.resuming ? dict.resumeText : dict.composeText}
          </p>
          <Link className={styles.journeyButton} href={action.href}>
            <span>{action.resuming ? dict.resumeButton : dict.composeButton}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>
      )}
      {journeyError && (
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-grisclair">
          <p role="alert">{dict.journeyLoadError}</p>
          <button type="button" onClick={retry} className="text-or underline underline-offset-4">{caurisCopy.retry}</button>
        </div>
      )}

      <ConsultationStatus copy={caurisCopy} lang={lang} className={styles.consultation} showComposeAction={false} />

      {/* grille des œuvres */}
      <div className={`${styles.works} flex flex-col gap-5`}>
        {works.length > 0 && <h2 className={styles.worksTitle}>{dict.totemTitle}</h2>}

        {commandes === null && !error && <p role="status" className="text-sm text-grisclair">{ui.status.loading}</p>}
        {delayNotice && <p role="alert" className="text-sm text-grisclair">{delayNotice}</p>}
        {error && !delayNotice && <p role="alert" className="text-sm text-grisclair">{ui.errors.orderUnavailable}</p>}

        {works.length > 0 && (
          <div className={accountStyles.grid}>
            {works.map((commande) => (
              <AccountWorkCard key={commande.id} commande={commande} lang={lang} headingLevel={3} labels={{ ...dict, serial: ui.orders.serial }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
