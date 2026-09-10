import { NextResponse } from "next/server";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { internalError } from "@/lib/api-error";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const { data: commandes, error } = await supabase
    .from("commandes")
    .select("id, statut")
    .in("statut", ["paye", "en_generation", "erreur"])
    .order("created_at", { ascending: false });

  if (error) return internalError("admin.relancer-tout.POST", error);
  if (!commandes || commandes.length === 0) {
    return NextResponse.json({ ok: true, message: "Aucune commande à relancer", results: [] });
  }

  const env = getServerEnv();
  const results: { commandeId: string; status: string; error?: string }[] = [];

  for (const cmd of commandes) {
    const { error: e1 } = await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", cmd.id);
    if (e1) {
      console.error("[admin.relancer-tout] reset_commande", cmd.id, e1);
      results.push({ commandeId: cmd.id, status: "ko", error: "Échec de réinitialisation de la commande" });
      continue;
    }

    const { error: e2 } = await supabase.from("oeuvres").update({ statut: "en_generation" }).eq("commande_id", cmd.id);
    if (e2) {
      console.error("[admin.relancer-tout] reset_oeuvre", cmd.id, e2);
      results.push({ commandeId: cmd.id, status: "ko", error: "Échec de réinitialisation de l'œuvre" });
      continue;
    }

    const { error: e3 } = await supabase.from("erreurs_pipeline").delete().eq("commande_id", cmd.id);
    if (e3) {
      console.error("[admin.relancer-tout] efface_erreurs", cmd.id, e3);
      results.push({ commandeId: cmd.id, status: "ko", error: "Échec de nettoyage des erreurs précédentes" });
      continue;
    }

    results.push({ commandeId: cmd.id, status: "ok" });
  }

  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    for (const r of results) {
      if (r.status !== "ok") continue;
      try {
        await fetch(`${backendUrl}/orders/retry`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") ?? "" },
          body: JSON.stringify({ externalCommandId: r.commandeId }),
        });
      } catch {
        r.status = "ko";
        r.error = "backend_unreachable";
      }
    }
  }

  const hasErrors = results.some((r) => r.status === "ko");

  await logAdminAction(supabase, admin, "relancer_tout", {
    total: commandes.length,
    reussies: results.filter((r) => r.status === "ok").length,
    echouees: results.filter((r) => r.status === "ko").length,
  });

  return NextResponse.json({ ok: !hasErrors, total: commandes.length, results }, { status: hasErrors ? 502 : 200 });
}
