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

  const now = new Date();
  const trenteJours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: commandes, error: cmdError } = await supabase
    .from("commandes")
    .select("created_at, montant_cents, statut")
    .gte("created_at", trenteJours.toISOString())
    .order("created_at", { ascending: true });

  if (cmdError) {
    return NextResponse.json({ error: cmdError.message }, { status: 500 });
  }

  const { data: profiles, error: profError } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", trenteJours.toISOString());

  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 500 });
  }

  const jours: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    jours.push(d.toISOString().slice(0, 10));
  }

  const jourMap = new Map<string, { commandes: number; revenu: number; inscriptions: number }>();

  for (const j of jours) {
    jourMap.set(j, { commandes: 0, revenu: 0, inscriptions: 0 });
  }

  for (const c of commandes ?? []) {
    const jour = c.created_at.slice(0, 10);
    const entry = jourMap.get(jour);
    if (entry) {
      entry.commandes += 1;
      if (c.statut !== "remboursee" && c.statut !== "erreur") {
        entry.revenu += c.montant_cents ?? 0;
      }
    }
  }

  for (const p of profiles ?? []) {
    const jour = p.created_at.slice(0, 10);
    const entry = jourMap.get(jour);
    if (entry) {
      entry.inscriptions += 1;
    }
  }

  const serie = jours.map((jour) => {
    const d = jourMap.get(jour)!;
    return { date: jour, commandes: d.commandes, revenu: d.revenu, inscriptions: d.inscriptions };
  });

  return NextResponse.json({ serie });
}
