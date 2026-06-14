import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
import { generateCoffret } from "@/lib/services/pipeline";

export async function POST(request: Request) {
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

  const { commandeId } = await request.json() as { commandeId: string };
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId requis" }, { status: 400 });
  }

  const { data: commande } = await supabase
    .from("commandes")
    .select("statut")
    .eq("id", commandeId)
    .single();

  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (commande.statut !== "erreur") {
    return NextResponse.json({ error: "Seules les commandes en erreur peuvent etre relancees" }, { status: 400 });
  }

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
  await supabase.from("oeuvres").update({ statut: "en_cours" }).eq("commande_id", commandeId);

  generateCoffret(commandeId).catch(() => {});

  return NextResponse.json({ success: true, message: "Pipeline relance" });
}
