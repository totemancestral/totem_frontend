import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { logAdminAction } from "@/lib/admin-audit";
import { requestAdminRetry, retryHeaders } from "@/lib/server/admin-retry";

const schema = z.object({ commandeId: z.string().uuid() });
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_commande_id" }, { status: 400 });
  if (!getServerEnv().TOTEM_BACKEND_URL) return NextResponse.json({ ok: false, error: "backend_unavailable" }, { status: 503, headers: retryHeaders() });
  const reply = await requestAdminRetry(request, parsed.data.commandeId);
  await logAdminAction(createServiceClient(), admin, "relancer", { ...reply.result })
    .catch(() => console.error("[admin.relancer] audit log unavailable"));
  return NextResponse.json({ ok: reply.result.status === "ok", ...reply.result, results: [reply.result],
    ...(reply.retryAfter === undefined ? {} : { retryAfter: reply.retryAfter }) }, { status: reply.status, headers: retryHeaders(reply.retryAfter) });
}
