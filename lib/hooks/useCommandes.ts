"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { retryNotice } from "@/lib/retry-after";

export type CommandeOeuvre = {
  nom_totem: string | null;
  image_url: string | null;
  numero_serie: string | null;
  statut: string;
};

export type CommandeRow = {
  id: string;
  offre: string;
  statut: string;
  montant_cents: number;
  devise: string;
  langue: string;
  created_at: string;
  stripe_session_id?: string | null;
  requiresQuestionnaire?: boolean;
  oeuvre: CommandeOeuvre | null;
};

/** Commandes (+ œuvre livrée si elle existe) du visiteur connecté. */
export function useCommandes(lang: "fr" | "en" = "fr") {
  const [commandes, setCommandes] = useState<CommandeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [delayNotice, setDelayNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let loading = false;
    let lastRefresh = 0;

    async function load() {
      if (loading) return;
      loading = true;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (alive) setError("unauthenticated");
          return;
        }

        const response = await fetch("/api/commandes", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          if (alive) setDelayNotice(retryNotice(response, lang));
          if (alive) setError("fetch_failed");
          return;
        }
        const raw = (await response.json()) as (Omit<CommandeRow, "oeuvre"> & {
          oeuvres: CommandeOeuvre | CommandeOeuvre[] | null;
        })[];

        if (alive) {
          lastRefresh = Date.now();
          setError(null);
          setDelayNotice(null);
          setCommandes(
            raw.map(({ oeuvres, ...rest }) => ({
              ...rest,
              oeuvre: Array.isArray(oeuvres) ? (oeuvres[0] ?? null) : oeuvres,
            })),
          );
        }
      } catch {
        if (alive) setError("fetch_failed");
      } finally {
        loading = false;
      }
    }
    void load();
    const timer = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 45 * 60_000);
    const onReturn = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefresh >= 30 * 60_000) void load();
    };
    document.addEventListener("visibilitychange", onReturn);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [lang]);

  return { commandes, error, delayNotice };
}
