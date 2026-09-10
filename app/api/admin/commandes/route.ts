import { NextResponse } from "next/server";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const url = new URL(request.url);
  const statut = url.searchParams.get("statut")?.trim();
  const offre = url.searchParams.get("offre")?.trim();
  const search = sanitizeSearch(url.searchParams.get("search") ?? "");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("commandes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) query = query.eq("statut", statut as never);
  if (offre) query = query.eq("offre", offre as never);

  if (search) {
    const matchingUsers = await findMatchingUserIds(supabase, search);
    if (matchingUsers.length > 0) {
      query = query.in("user_id", matchingUsers);
    } else {
      const conditions = [
        `stripe_session_id.ilike.%${search}%`,
        `stripe_payment_intent_id.ilike.%${search}%`,
      ];
      if (isUuid(search)) {
        conditions.push(`id.eq.${search}`, `user_id.eq.${search}`, `reponses_id.eq.${search}`);
      }
      query = query.or(conditions.join(","));
    }
  }

  const { data: commandes, error, count } = await query;
  if (error) return internalError("admin.commandes.GET", error);

  const userIds = [...new Set((commandes ?? []).map((c) => c.user_id))];
  const profilesById = await getProfilesById(supabase, userIds);

  return NextResponse.json({
    commandes: (commandes ?? []).map((commande) => ({
      ...commande,
      client_email: profilesById.get(commande.user_id)?.email ?? null,
      client_prenom: profilesById.get(commande.user_id)?.prenom ?? null,
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

async function findMatchingUserIds(supabase: ReturnType<typeof createServiceClient>, search: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`email.ilike.%${search}%,prenom.ilike.%${search}%`)
    .limit(100);
  return (data ?? []).map((p) => p.id);
}

async function getProfilesById(supabase: ReturnType<typeof createServiceClient>, ids: string[]) {
  const profiles = new Map<string, { email: string | null; prenom: string | null }>();
  if (ids.length === 0) return profiles;
  const { data } = await supabase.from("profiles").select("id, email, prenom").in("id", ids);
  for (const p of data ?? []) profiles.set(p.id, { email: p.email, prenom: p.prenom });
  return profiles;
}
