import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/server-auth";

/**
 * Brouillon de parcours : sauvegarde serveur de la progression.
 *
 * On reutilise la table `reponses_parcours` sans migration : un brouillon vit
 * dans sa propre ligne, identifiee par un `session_id` reserve. Les lignes de
 * parcours terminees utilisent `session_id = user_id`, il n'y a donc aucune
 * collision possible avec les commandes payees.
 *
 * Le client anonyme porte l'autorisation du visiteur : la RLS « Users manage
 * own parcours » garantit qu'un compte ne peut lire ou ecrire que ses propres
 * brouillons. La suppression n'etant pas accordee au role `authenticated`, on
 * « efface » un brouillon en le marquant termine avec un etat vide.
 */

const TRACKS = ["adulte", "junior"] as const;
type Track = (typeof TRACKS)[number];

function draftSessionId(track: Track) {
  return `brouillon:${track}`;
}

const draftStateSchema = z.object({
  index: z.number().int().min(0).max(64),
  phase: z.string().min(1).max(48),
  answers: z.record(z.string(), z.unknown()).default({}),
  sexe: z.enum(["homme", "femme"]).nullish(),
  hasUnlockedRest: z.boolean().optional(),
  paidCommandId: z.string().nullish(),
  /** Prenom saisi sur la piste junior, pour reprendre sans le redemander. */
  prenom: z.string().max(80).optional(),
  /** Numero de la question affichee, pour l'intitule du bouton « Continuer ». */
  questionNumber: z.number().int().min(0).max(64).optional(),
  totalQuestions: z.number().int().min(1).max(64).optional(),
  updatedAt: z.string().min(1).max(40),
});

const saveSchema = z.object({
  piste: z.enum(TRACKS),
  langue: z.enum(["fr", "en"]).default("fr"),
  etat: draftStateSchema,
});

const clearSchema = z.object({ piste: z.enum(TRACKS) });

export type ParcoursDraftState = z.infer<typeof draftStateSchema>;
export type ParcoursDraft = ParcoursDraftState & { piste: Track; langue: "fr" | "en" };

type DraftRow = {
  session_id: string;
  reponses: unknown;
  langue: string | null;
  termine: boolean | null;
  updated_at: string | null;
};

async function draftClient(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { authorization: request.headers.get("authorization") ?? "" } },
  });
}

function readDraft(row: DraftRow): ParcoursDraft | null {
  if (row.termine) return null;
  const track = TRACKS.find((candidate) => row.session_id === draftSessionId(candidate));
  if (!track) return null;

  const parsed = draftStateSchema.safeParse(row.reponses);
  if (!parsed.success) return null;
  // Un brouillon sans aucune reponse n'a rien a reprendre.
  if (Object.keys(parsed.data.answers).length === 0) return null;

  return {
    ...parsed.data,
    piste: track,
    langue: row.langue === "en" ? "en" : "fr",
  };
}

/** Renvoie les brouillons en cours du visiteur, par piste. */
export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = await draftClient(request);
  if (!supabase) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("reponses_parcours")
    .select("session_id, reponses, langue, termine, updated_at")
    .eq("user_id", auth.userId)
    .in(
      "session_id",
      TRACKS.map(draftSessionId),
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const brouillons: Partial<Record<Track, ParcoursDraft>> = {};
  for (const row of (data ?? []) as DraftRow[]) {
    const draft = readDraft(row);
    if (draft) brouillons[draft.piste] = draft;
  }

  return NextResponse.json({ brouillons });
}

/** Enregistre la progression courante du visiteur. */
export async function PUT(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Brouillon invalide" }, { status: 422 });
  }

  const supabase = await draftClient(request);
  if (!supabase) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { error } = await supabase.from("reponses_parcours").upsert(
    {
      user_id: auth.userId,
      session_id: draftSessionId(parsed.data.piste),
      reponses: parsed.data.etat as unknown as Record<string, unknown>,
      langue: parsed.data.langue,
      termine: false,
    },
    { onConflict: "user_id, session_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enregistre: true });
}

/**
 * Referme un brouillon (parcours termine ou redemarre). Le role
 * `authenticated` n'a pas le droit DELETE sur la table : on neutralise donc la
 * ligne plutot que de la supprimer.
 */
export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = clearSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Piste invalide" }, { status: 422 });
  }

  const supabase = await draftClient(request);
  if (!supabase) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { error } = await supabase.from("reponses_parcours").upsert(
    {
      user_id: auth.userId,
      session_id: draftSessionId(parsed.data.piste),
      reponses: {},
      termine: true,
    },
    { onConflict: "user_id, session_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ efface: true });
}
