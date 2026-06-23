import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const url = new URL(request.url);
  const statut = url.searchParams.get("statut")?.trim();
  const fichier = url.searchParams.get("fichier")?.trim();
  const search = sanitizeSearch(url.searchParams.get("search") ?? "");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("oeuvres")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) {
    query = query.eq("statut", statut);
  }

  if (fichier === "image") query = query.not("image_url", "is", null);
  if (fichier === "audio") query = query.not("audio_url", "is", null);
  if (fichier === "pdf") query = query.not("pdf_url", "is", null);
  if (fichier === "complete") {
    query = query
      .not("image_url", "is", null)
      .not("audio_url", "is", null)
      .not("pdf_url", "is", null);
  }
  if (fichier === "incomplete") {
    query = query.or("image_url.is.null,audio_url.is.null,pdf_url.is.null");
  }

  if (search) {
    const matchingUsers = await findMatchingUserIds(supabase, search);
    if (matchingUsers.length > 0) {
      query = query.in("user_id", matchingUsers);
    } else {
      const conditions = [`nom_totem.ilike.%${search}%`, `numero_serie.ilike.%${search}%`];
      if (isUuid(search)) {
        conditions.push(`id.eq.${search}`, `user_id.eq.${search}`, `commande_id.eq.${search}`);
      }
      query = query.or(conditions.join(","));
    }
  }

  const { data: oeuvres, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((oeuvres ?? []).map((oeuvre) => oeuvre.user_id))];
  const commandeIds = [...new Set((oeuvres ?? []).map((oeuvre) => oeuvre.commande_id))];
  const [profilesById, commandesById] = await Promise.all([
    getProfilesById(supabase, userIds),
    getCommandesById(supabase, commandeIds),
  ]);

  return NextResponse.json({
    oeuvres: (oeuvres ?? []).map((oeuvre) => ({
      ...oeuvre,
      client_email: profilesById.get(oeuvre.user_id)?.email ?? null,
      client_prenom: profilesById.get(oeuvre.user_id)?.prenom ?? null,
      commande_offre: commandesById.get(oeuvre.commande_id)?.offre ?? null,
      commande_statut: commandesById.get(oeuvre.commande_id)?.statut ?? null,
    })),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}

function sanitizeSearch(value: string) {
  return value.trim().replace(/[(),]/g, "").slice(0, 96);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function findMatchingUserIds(
  supabase: ReturnType<typeof createServiceClient>,
  search: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`email.ilike.%${search}%,prenom.ilike.%${search}%`)
    .limit(100);

  return (data ?? []).map((profile) => profile.id);
}

async function getProfilesById(supabase: ReturnType<typeof createServiceClient>, ids: string[]) {
  const profiles = new Map<string, { email: string | null; prenom: string | null }>();
  if (ids.length === 0) return profiles;

  const { data } = await supabase.from("profiles").select("id, email, prenom").in("id", ids);
  for (const profile of data ?? []) {
    profiles.set(profile.id, { email: profile.email, prenom: profile.prenom });
  }

  return profiles;
}

async function getCommandesById(supabase: ReturnType<typeof createServiceClient>, ids: string[]) {
  const commandes = new Map<string, { offre: string; statut: string }>();
  if (ids.length === 0) return commandes;

  const { data } = await supabase.from("commandes").select("id, offre, statut").in("id", ids);
  for (const commande of data ?? []) {
    commandes.set(commande.id, { offre: commande.offre, statut: commande.statut });
  }

  return commandes;
}
