import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const [totalRes, revenueRes, statusRes, errorRes, todayRes] = await Promise.all([
    supabase.from("commandes").select("*", { count: "exact", head: true }),
    supabase
      .from("commandes")
      .select("montant_cents")
      .in("statut", ["paye", "en_generation", "livree"]),
    supabase
      .from("commandes")
      .select("statut", { count: "exact" })
      .in("statut", ["paye", "en_generation", "livree"]),
    supabase.from("commandes").select("*", { count: "exact", head: true }).eq("statut", "erreur"),
    supabase
      .from("commandes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const totalRevenue = revenueRes.data?.reduce((sum, c) => sum + (c.montant_cents ?? 0), 0) ?? 0;

  return NextResponse.json({
    totalCommandes: totalRes.count ?? 0,
    commandesActives: statusRes.count ?? 0,
    revenuTotal: totalRevenue,
    erreurs: errorRes.count ?? 0,
    aujourdHui: todayRes.count ?? 0,
  });
}
