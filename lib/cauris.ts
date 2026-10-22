import { supabase } from "@/lib/supabase/client";

export const CAURIS_MOODS = ["apaise", "en_doute", "en_combat"] as const;
export type CaurisMood = (typeof CAURIS_MOODS)[number];
export type CaurisReading = {
  id: string; weekKey: string; createdAt: string; archetypeId: string; ancestralName: string | null;
  mood: CaurisMood | null; language: "fr"; image: string | null; parole: string | null; geste: string | null;
};
export type CaurisState = {
  accessible: boolean; reason?: "oeuvre_required" | "serie_indisponible";
  availableNow?: boolean; nextAvailableAt?: string | null; currentReading: CaurisReading | null;
};

export async function caurisRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("unauthenticated");
  const response = await fetch(`/api/consultations/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store", signal,
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw new Error(response.status === 401 ? "unauthenticated" : payload?.error ?? "consultation_unavailable");
  return payload as T;
}

export function caurisDate(value: string, lang: "fr" | "en") {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
