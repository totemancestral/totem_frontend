"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { ConsultationStatus } from "@/components/sections/ConsultationStatus";
import { CaurisReading } from "@/components/ui/CaurisReading";
import { retryErrorNotice } from "@/lib/retry-after";
import { formatInterface, interfaceCopy } from "@/lib/interface-copy";
import { CAURIS_MOODS, caurisDate, caurisRequest, type CaurisReading as Reading } from "@/lib/cauris";

export default function Consultations({ dict, copy, lang }: { dict: Dictionary["consultations"]; copy: Dictionary["cauris"]; lang: Locale }) {
  const [readings, setReadings] = useState<Reading[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [delayNotice, setDelayNotice] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const historyTitleRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef(false);
  useEffect(() => {
    if (!pendingFocus.current || loadingMore) return;
    pendingFocus.current = false;
    if (error) errorRef.current?.focus();
    else historyTitleRef.current?.focus();
  }, [loadingMore, error]);
  useEffect(() => {
    const controller = new AbortController();
    void caurisRequest<{ readings: Reading[]; nextCursor: string | null }>("historique", undefined, controller.signal, lang).then((data) => {
      if (!controller.signal.aborted) { setReadings(data.readings); setCursor(data.nextCursor); setError(false); }
    }).catch((error) => { if (!controller.signal.aborted) { setDelayNotice(retryErrorNotice(error, lang)); setError(true); } });
    return () => controller.abort();
  }, [revision, lang]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    pendingFocus.current = true;
    try {
      const data = await caurisRequest<{ readings: Reading[]; nextCursor: string | null }>(`historique?before=${encodeURIComponent(cursor)}`, undefined, undefined, lang);
      setReadings((previous) => [...(previous ?? []), ...data.readings.filter((r) => !previous?.some((p) => p.id === r.id))]);
      setCursor(data.nextCursor); setError(false);
    } catch (error) { setDelayNotice(retryErrorNotice(error, lang)); setError(true); } finally { setLoadingMore(false); }
  }
  return (
    <div className="mx-auto min-w-0 max-w-7xl px-6 py-12 [overflow-wrap:anywhere] lg:pl-0 lg:pr-16">
      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h1>
        <p className="mt-1 max-w-lg text-sm text-grisclair">{dict.intro}</p>
      </div>

      {/* carte de statut : toujours visible — si le Totem n'est pas encore
          composé, le tirage lui-même (ConsultationTirage) invite à le
          composer plutôt que de cacher l'entrée de la consultation. */}
      <ConsultationStatus copy={copy} lang={lang} />

      {/* historique */}
      <div className="mt-10 flex flex-col gap-5">
        <h2 ref={historyTitleRef} tabIndex={-1} className="text-xs uppercase tracking-[0.2em] text-or focus:outline-2 focus:outline-offset-4 focus:outline-or">{dict.historyLabel}</h2>
        <p role="status" className="sr-only">{loadingMore ? copy.loading : readings ? formatInterface(interfaceCopy(lang).orders.displayedReadings, { count: readings.length }) : ""}</p>

        {!readings && !error && <p role="status" className="text-grisclair">{copy.loading}</p>}
        {error && <div className="flex flex-wrap items-center gap-4"><p ref={errorRef} tabIndex={-1} role="alert" className="text-grisclair focus:outline-2 focus:outline-offset-4 focus:outline-or">{delayNotice ?? copy.loadError}</p><Button onClick={() => { if (readings && cursor) void loadMore(); else setRevision((r) => r + 1); }}>{copy.retry}</Button></div>}
        {readings?.length === 0 && <p className="text-sm text-grisclair">{copy.emptyHistory}</p>}
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {readings?.map((item) => (
            <div key={item.id} className="flex flex-col gap-5 border border-ombre bg-indigo p-6">
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl italic text-orpale">{item.mood ? copy.moods[CAURIS_MOODS.indexOf(item.mood)] : copy.readingTitle}</span>
                <time dateTime={item.createdAt} className="text-xs text-grisclair">{caurisDate(item.createdAt, lang)}</time>
              </div>
              <CaurisReading reading={item} copy={copy} lang={lang} />
            </div>
          ))}
        </div>
        {cursor && <Button disabled={loadingMore} onClick={loadMore}>{loadingMore ? copy.loading : copy.loadMore}</Button>}
      </div>
    </div>
  );
}
