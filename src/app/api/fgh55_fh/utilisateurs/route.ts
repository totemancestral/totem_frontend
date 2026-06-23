import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,prenom.ilike.%${search}%`);
  }

  const { data: profiles, error: profilesError, count } = await query;

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const enriched = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { count: commandesCount } = await supabase
        .from("commandes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", p.id);

      const { count: actives } = await supabase
        .from("commandes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", p.id)
        .in("statut", ["paye", "en_generation"] as never[]);

      return { ...p, total_commandes: commandesCount ?? 0, commandes_actives: actives ?? 0 };
    }),
  );

  return NextResponse.json({
    utilisateurs: enriched,
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}
