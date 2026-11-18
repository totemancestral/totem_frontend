"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { adultDraftSchema } from "@/lib/adult-flow";
import { z } from "zod";
import type { Locale } from "@/app/[lang]/dictionaries";

const progressSchema = z.object({
  parcoursId: z.uuid().nullable(),
  answers: adultDraftSchema,
  completed: z.boolean().optional(),
});

export type TotemJourney = { href: string; resuming: boolean };

/** Restore the same saved journey as the questionnaire, before offering a CTA. */
export function useTotemJourney(lang: Locale, enabled: boolean) {
  const [journey, setJourney] = useState<TotemJourney | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("unauthenticated");
      const response = await fetch("/api/parcours", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: "no-store",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      });
      if (!response.ok) throw new Error("progress_unavailable");
      const progress = progressSchema.parse(await response.json());
      if (controller.signal.aborted) return;
      if (progress.completed) { setJourney(null); return; }
      // An existing adult draft takes priority, even if the account started as junior.
      if (progress.parcoursId) {
        setJourney({ href: `/${lang}/parcours?parcours=${encodeURIComponent(progress.parcoursId)}`, resuming: true });
      } else {
        const metadata = data.session.user.user_metadata;
        const junior = metadata.parcours === "junior" || (!metadata.parcours && metadata.naissance_concerne === "enfant");
        let juniorReadyForPayment = false;
        if (junior) {
          try {
            const saved = adultDraftSchema.safeParse(JSON.parse(sessionStorage.getItem("totem:parcours:junior:answers") ?? "{}"));
            juniorReadyForPayment = saved.success && [1, 2, 3, 4, 5].every((number) => Boolean(saved.data[String(number)]?.choice));
          } catch { /* Unavailable local storage leaves the start link usable. */ }
        }
        setJourney({
          href: `/${lang}/${juniorReadyForPayment ? "paiement-junior" : junior ? "parcours-junior" : "parcours"}`,
          resuming: juniorReadyForPayment,
        });
      }
      setError(false);
    }
    void load().catch(() => {
      if (!controller.signal.aborted) { setJourney(null); setError(true); }
    });
    return () => controller.abort();
  }, [enabled, lang, revision]);

  function retry() { setError(false); setRevision((value) => value + 1); }
  return { journey: enabled ? journey : null, error: enabled && error, retry };
}
