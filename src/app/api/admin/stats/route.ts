import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const auth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await auth.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (!roles || roles.length === 0) {
    return NextResponse.json({ error: "Acces admin requis" }, { status: 403 });
  }

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
    supabase
      .from("commandes")
      .select("*", { count: "exact", head: true })
      .eq("statut", "erreur"),
    supabase
      .from("commandes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const totalRevenue =
    revenueRes.data?.reduce((sum, c) => sum + (c.montant_cents ?? 0), 0) ?? 0;

  return NextResponse.json({
    totalCommandes: totalRes.count ?? 0,
    commandesActives: statusRes.count ?? 0,
    revenuTotal: totalRevenue,
    erreurs: errorRes.count ?? 0,
    aujourdHui: todayRes.count ?? 0,
  });
}
