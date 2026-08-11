import { apiPath } from "@/lib/routes";

/** Piste de parcours : adulte (10 questions) ou junior (5 questions). */
export type DraftTrack = "adulte" | "junior";

export type ParcoursDraft = {
  piste: DraftTrack;
  langue: "fr" | "en";
  index: number;
  phase: string;
  answers: Record<string, unknown>;
  sexe?: "homme" | "femme" | null;
  hasUnlockedRest?: boolean;
  paidCommandId?: string | null;
  prenom?: string;
  questionNumber?: number;
  totalQuestions?: number;
  updatedAt: string;
};

export type ParcoursDraftState = Omit<ParcoursDraft, "piste" | "langue">;

const DRAFT_ENDPOINT = apiPath("parcours", "/brouillon");

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Recupere les brouillons du visiteur connecte.
 *
 * Un echec reseau n'est jamais bloquant : la progression locale prend alors le
 * relais, le visiteur ne perd rien.
 */
export async function fetchParcoursDrafts(
  accessToken: string,
): Promise<Partial<Record<DraftTrack, ParcoursDraft>>> {
  try {
    const response = await fetch(DRAFT_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return {};
    const payload = (await response.json()) as {
      brouillons?: Partial<Record<DraftTrack, ParcoursDraft>>;
    };
    return payload.brouillons ?? {};
  } catch {
    return {};
  }
}

/** Enregistre la progression courante. Silencieux en cas d'echec. */
export async function saveParcoursDraft(
  accessToken: string,
  piste: DraftTrack,
  langue: "fr" | "en",
  etat: ParcoursDraftState,
): Promise<void> {
  try {
    await fetch(DRAFT_ENDPOINT, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ piste, langue, etat }),
    });
  } catch {
    /* hors ligne : la sauvegarde locale suffit jusqu'au prochain changement */
  }
}

/** Referme un brouillon quand le parcours est termine ou redemarre. */
export async function clearParcoursDraft(
  accessToken: string,
  piste: DraftTrack,
): Promise<void> {
  try {
    await fetch(DRAFT_ENDPOINT, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ piste }),
    });
  } catch {
    /* non bloquant */
  }
}

/**
 * Compare deux horodatages ISO. Renvoie vrai si `candidate` est plus recent
 * que `reference`, ce qui permet de faire gagner l'appareil sur lequel le
 * visiteur a repondu en dernier.
 */
export function isNewer(candidate?: string | null, reference?: string | null): boolean {
  if (!candidate) return false;
  if (!reference) return true;
  const a = Date.parse(candidate);
  const b = Date.parse(reference);
  if (Number.isNaN(a)) return false;
  if (Number.isNaN(b)) return true;
  return a > b;
}
