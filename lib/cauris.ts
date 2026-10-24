import { supabase } from "@/lib/supabase/client";
import { RetryAfterError, retryNotice } from "@/lib/retry-after";
import { REQUEST_TIMING, requestSignal } from "@/lib/request-timing";

export const CAURIS_MOODS = ["apaise", "en_doute", "en_combat"] as const;
export type CaurisMood = (typeof CAURIS_MOODS)[number];
export type CaurisReading = {
  id: string; weekKey: string; createdAt: string; archetypeId: string; ancestralName: string | null;
  mood: CaurisMood | null; language: "fr" | "en"; image: string | null; parole: string | null; geste: string | null;
};
export type CaurisState = {
  accessible: boolean; reason?: "oeuvre_required" | "serie_indisponible";
  availableNow?: boolean; nextAvailableAt?: string | null; currentReading: CaurisReading | null;
};

export async function caurisRequest<T>(path: string, body?: unknown, signal?: AbortSignal, lang: "fr" | "en" = "fr"): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("unauthenticated");
  const response = await fetch(`/api/consultations/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    signal: requestSignal(body === undefined ? REQUEST_TIMING.read : REQUEST_TIMING.draw, signal),
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json", "Accept-Language": lang },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (retryNotice(response, lang)) throw new RetryAfterError(response);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw new Error(response.status === 401 ? "unauthenticated" : payload?.error ?? "consultation_unavailable");
  return payload as T;
}

export function caurisDate(value: string, lang: "fr" | "en") {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
