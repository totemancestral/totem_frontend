import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const url = new URL(request.url);
  const statut = url.searchParams.get("statut");
  const search = url.searchParams.get("search");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("commandes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) {
    query = query.eq("statut", statut as never);
  }

  if (search) {
    query = query.or(`id.ilike.%${search}%`);
  }

  const { data: commandes, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    commandes,
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}
