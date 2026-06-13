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

  const { data: erreurs, error: errError } = await (supabase as any)
    .from("erreurs_pipeline")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (errError) {
    return NextResponse.json({ error: errError.message }, { status: 500 });
  }

  const { data: changements, error: chgError } = await supabase
    .from("commandes")
    .select("id, offre, statut, updated_at, user_id")
    .neq("statut", "en_attente_paiement")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (chgError) {
    return NextResponse.json({ error: chgError.message }, { status: 500 });
  }

  return NextResponse.json({
    erreurs: erreurs ?? [],
    changements: changements ?? [],
  });
}
