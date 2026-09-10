"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Interroge une route /api/admin/* avec le jeton de la session courante.
 * `params` change de référence à chaque rendu si on passe un objet littéral :
 * on le sérialise donc pour ne redéclencher l'effet que si son contenu change.
 */
export function useAdminFetch<T>(path: string, params?: Record<string, string | undefined>) {
  const paramsKey = JSON.stringify(params ?? {});
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- repasse en chargement à chaque nouveau fetch (filtres, pagination, reload)
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (alive) setState({ data: null, loading: false, error: "unauthenticated" });
        return;
      }

      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(JSON.parse(paramsKey) as Record<string, string | undefined>)) {
        if (value) query.set(key, value);
      }
      const qs = query.toString();

      try {
        const response = await fetch(`${path}${qs ? `?${qs}` : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json().catch(() => null);
        if (!alive) return;
        if (!response.ok) {
          setState({ data: null, loading: false, error: payload?.error ?? "Erreur de chargement" });
          return;
        }
        setState({ data: payload, loading: false, error: null });
      } catch {
        if (alive) setState({ data: null, loading: false, error: "Erreur de chargement" });
      }
    })();

    return () => {
      alive = false;
    };
  }, [path, paramsKey, reloadToken]);

  return { ...state, reload };
}

/** Appel POST admin ponctuel (actions : relancer, relancer-tout...). */
export async function adminPost<T>(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { ok: false, status: 401, data: null };

  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}
