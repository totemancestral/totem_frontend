import { NextResponse } from "next/server";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { commandeId } = await request.json().catch(() => ({}));
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId requis" }, { status: 400 });
  }

  const env = getServerEnv();
  const supabase = createServiceClient();

  const { error: cmdError } = await supabase.from("commandes").select("id, statut").eq("id", commandeId).single();
  if (cmdError) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const results: { etape: string; status: string; error?: string }[] = [];

  const { error: e1 } = await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
  if (e1) console.error("[admin.relancer] reset_commande", commandeId, e1);
  results.push(
    e1
      ? { etape: "reset_commande", status: "ko", error: "Échec de réinitialisation de la commande" }
      : { etape: "reset_commande", status: "ok" },
  );

  const { error: e2 } = await supabase.from("oeuvres").update({ statut: "en_generation" }).eq("commande_id", commandeId);
  if (e2) console.error("[admin.relancer] reset_oeuvre", commandeId, e2);
  results.push(
    e2
      ? { etape: "reset_oeuvre", status: "ko", error: "Échec de réinitialisation de l'œuvre" }
      : { etape: "reset_oeuvre", status: "ok" },
  );

  const { error: e3 } = await supabase.from("erreurs_pipeline").delete().eq("commande_id", commandeId);
  if (e3) console.error("[admin.relancer] efface_erreurs", commandeId, e3);
  results.push(
    e3
      ? { etape: "efface_erreurs", status: "ko", error: "Échec de nettoyage des erreurs précédentes" }
      : { etape: "efface_erreurs", status: "ok" },
  );

  if (env.TOTEM_BACKEND_URL) {
    try {
      const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
      const backendResponse = await fetch(`${backendUrl}/orders/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") ?? "" },
        body: JSON.stringify({ externalCommandId: commandeId }),
      });

      if (backendResponse.ok) {
        results.push({ etape: "notify_backend", status: "ok" });
      } else {
        const payload = await backendResponse.json().catch(() => null);
        results.push({
          etape: "notify_backend",
          status: "ko",
          error: payload?.message || payload?.error || `HTTP ${backendResponse.status}`,
        });
      }
    } catch (error) {
      console.error("[admin.relancer] notify_backend", commandeId, error);
      results.push({ etape: "notify_backend", status: "ko", error: "backend_unreachable" });
    }
  }

  const hasErrors = results.some((r) => r.status === "ko");

  await logAdminAction(supabase, admin, "relancer", { commandeId, results });

  return NextResponse.json({ ok: !hasErrors, commandeId, results }, { status: hasErrors ? 502 : 200 });
}
