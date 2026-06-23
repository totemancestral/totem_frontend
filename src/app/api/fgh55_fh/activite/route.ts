import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

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
