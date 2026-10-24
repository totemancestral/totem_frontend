import { NextResponse } from "next/server";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { internalError } from "@/lib/api-error";
import { logAdminAction } from "@/lib/admin-audit";
import { requestAdminRetry, retryHeaders, type RetryResult } from "@/lib/server/admin-retry";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  if (!getServerEnv().TOTEM_BACKEND_URL) return NextResponse.json({ ok: false, error: "backend_unavailable" }, { status: 503, headers: retryHeaders() });
  const supabase = createServiceClient();
  const { data: commandes, error } = await supabase.from("commandes").select("id, statut")
    .in("statut", ["paye", "en_generation", "erreur"]).order("created_at", { ascending: false });
  if (error) return internalError("admin.relancer-tout.POST", error);
  const results: RetryResult[] = [];
  let stopStatus = 0;
  let retryAfter: number | undefined;
  const deadline = Date.now() + 25_000;
  for (const cmd of commandes ?? []) {
    if (stopStatus || request.signal.aborted || Date.now() >= deadline) {
      stopStatus ||= 503;
      results.push({ commandeId: cmd.id, status: "not_attempted", error: "retry_batch_interrupted" });
      continue;
    }
    const reply = await requestAdminRetry(request, cmd.id);
    results.push(reply.result);
    if ([429, 502, 503].includes(reply.status)) { stopStatus = reply.status; retryAfter = reply.retryAfter; }
  }
  const accepted = results.filter(r => r.outcome === "accepted").length;
  const alreadyRunning = results.filter(r => r.outcome === "already_running").length;
  const alreadyDone = results.filter(r => r.outcome === "already_done").length;
  const failed = results.filter(r => r.status === "ko").length;
  const notAttempted = results.filter(r => r.status === "not_attempted").length;
  const ok = failed === 0 && notAttempted === 0;
  await logAdminAction(supabase, admin, "relancer_tout", { total: results.length, accepted, alreadyRunning, alreadyDone, failed, notAttempted })
    .catch(() => console.error("[admin.relancer-tout] audit log unavailable"));
  return NextResponse.json({ ok, total: results.length, accepted, alreadyRunning, alreadyDone, failed, notAttempted, results,
    ...(retryAfter === undefined ? {} : { retryAfter }) }, { status: ok ? 200 : stopStatus || 502, headers: retryHeaders(retryAfter) });
}
