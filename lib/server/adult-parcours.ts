import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

export type AdultOrderState = {
  paid: boolean;
  offer: string;
  status: string;
  requiresQuestionnaire?: boolean;
};

/** Seul le backend, qui vérifie Stripe et le propriétaire, ouvre la suite. */
export async function readAdultPayment(request: Request, sessionId: string): Promise<AdultOrderState | NextResponse> {
  const { TOTEM_BACKEND_URL } = getServerEnv();
  if (!TOTEM_BACKEND_URL) return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  const response = await fetch(`${TOTEM_BACKEND_URL.replace(/\/$/, "")}/orders/session/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: request.headers.get("authorization") ?? "" },
    cache: "no-store",
  });
  if (response.status === 402) return { paid: false, offer: "", status: "pending" };
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    return NextResponse.json({ error: "payment_verification_failed" }, { status: response.ok ? 502 : response.status });
  }
  if (payload.offer === "junior") return NextResponse.json({ error: "adult_order_required" }, { status: 422 });
  return payload as AdultOrderState;
}

export async function readAdultDraft(userId: string, parcoursId?: string, sessionId?: string) {
  const db = createServiceClient();
  let requestedId = parcoursId;
  if (sessionId) {
    const { data, error } = await db.from("commandes").select("reponses_id")
      .eq("user_id", userId).eq("stripe_session_id", sessionId).maybeSingle();
    if (error) throw error;
    if (!data?.reponses_id) return null;
    if (requestedId && requestedId !== data.reponses_id) return null;
    requestedId = data.reponses_id;
  }
  let query = db.from("reponses_parcours").select("id, reponses, termine, langue")
    .eq("user_id", userId);
  query = requestedId ? query.eq("id", requestedId) : query.eq("termine", false);
  const { data: draft, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!draft) return null;
  let orderQuery = db.from("commandes").select("id, stripe_session_id, statut")
    .eq("user_id", userId).eq("reponses_id", draft.id);
  if (sessionId) orderQuery = orderQuery.eq("stripe_session_id", sessionId);
  const { data: command, error: commandError } = await orderQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (commandError) throw commandError;
  return { ...draft, command };
}
