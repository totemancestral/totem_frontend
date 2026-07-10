import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { commandeId } = await request.json().catch(() => ({}));
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId requis" }, { status: 400 });
  }

  const env = getServerEnv();
  const supabase = createServiceClient();

  const { data: commande, error: cmdError } = await supabase
    .from("commandes")
    .select("id, statut")
    .eq("id", commandeId)
    .single();

  if (cmdError) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const results: { etape: string; status: string; error?: string }[] = [];

  const { error: e1 } = await supabase
    .from("commandes")
    .update({ statut: "en_generation" })
    .eq("id", commandeId);

  if (e1) {
    results.push({ etape: "reset_commande", status: "ko", error: e1.message });
  } else {
    results.push({ etape: "reset_commande", status: "ok" });
  }

  const { error: e2 } = await supabase
    .from("oeuvres")
    .update({ statut: "en_generation" })
    .eq("commande_id", commandeId);

  if (e2) {
    results.push({ etape: "reset_oeuvre", status: "ko", error: e2.message });
  } else {
    results.push({ etape: "reset_oeuvre", status: "ok" });
  }

  const { error: e3 } = await supabase
    .from("erreurs_pipeline")
    .delete()
    .eq("commande_id", commandeId);

  if (e3) {
    results.push({ etape: "efface_erreurs", status: "ko", error: e3.message });
  } else {
    results.push({ etape: "efface_erreurs", status: "ok" });
  }

  if (env.TOTEM_BACKEND_URL) {
    try {
      const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
      const backendResponse = await fetch(`${backendUrl}/orders/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization") ?? "",
        },
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
      results.push({
        etape: "notify_backend",
        status: "ko",
        error: error instanceof Error ? error.message : "backend_unreachable",
      });
    }
  }

  const hasErrors = results.some((r) => r.status === "ko");
  return NextResponse.json(
    { ok: !hasErrors, commandeId, results },
    { status: hasErrors ? 502 : 200 },
  );
}
