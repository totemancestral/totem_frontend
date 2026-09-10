"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
  oeuvre: CommandeOeuvre | null;
};

/** Commandes (+ œuvre livrée si elle existe) du visiteur connecté. */
export function useCommandes() {
  const [commandes, setCommandes] = useState<CommandeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (alive) setError("unauthenticated");
        return;
      }

      try {
        const response = await fetch("/api/commandes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (alive) setError("fetch_failed");
          return;
        }
        const raw = (await response.json()) as (Omit<CommandeRow, "oeuvre"> & {
          oeuvres: CommandeOeuvre | CommandeOeuvre[] | null;
        })[];

        if (alive) {
          setCommandes(
            raw.map(({ oeuvres, ...rest }) => ({
              ...rest,
              oeuvre: Array.isArray(oeuvres) ? (oeuvres[0] ?? null) : oeuvres,
            })),
          );
        }
      } catch {
        if (alive) setError("fetch_failed");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { commandes, error };
}
