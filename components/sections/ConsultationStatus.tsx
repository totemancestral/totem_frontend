"use client";
import { Button } from "@/components/ui/Button";
import { useCaurisState } from "@/lib/hooks/useCaurisState";
import { caurisDate } from "@/lib/cauris";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

export function ConsultationStatus({ copy, lang }: { copy: Dictionary["cauris"]; lang: Locale }) {
  const { state, error, retry, delayNotice } = useCaurisState();
  return <div className="mt-9 flex min-w-0 flex-col items-start gap-6 border-[1.5px] border-or bg-indigo p-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-9">
    <div className="flex min-w-0 flex-col gap-2" aria-live="polite">
      <span className="text-xs uppercase tracking-wide text-or">{copy.thisWeek}</span>
      <p className="font-display text-xl italic text-ivoire">{error ? delayNotice ?? copy.loadError : !state ? copy.loading : state.currentReading ? copy.alreadyDrawn : state.accessible ? copy.available : state.reason === "serie_indisponible" ? copy.seriesUnavailable : copy.workRequired}</p>
      {state?.nextAvailableAt && <p className="text-sm text-grisclair">{copy.nextAvailable} {caurisDate(state.nextAvailableAt, lang)} · {copy.parisTime}</p>}
    </div>
    {error ? <Button onClick={retry}>{copy.retry}</Button> : state?.currentReading ? <Button href={`/${lang}/consultation-tirage`}>{copy.viewReading}</Button> : state?.accessible ? <Button href={`/${lang}/consultation-question`}>{copy.draw}</Button> : state?.reason === "oeuvre_required" ? <Button href={`/${lang}/offres`}>{copy.compose}</Button> : null}
  </div>;
}
