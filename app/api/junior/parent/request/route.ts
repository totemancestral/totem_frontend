import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { parentBackend } from "@/lib/server/parent-relay";
import { reservePendingCommande } from "@/lib/server/pending-commande";
import { juniorParentAnswersSchema, PARENT_CONSENT_VERSION } from "@/lib/junior-parent";
import { JUNIOR_AMOUNT_CENTS, JUNIOR_COMMANDE_OFFRE } from "@/lib/offers";
import { internalError } from "@/lib/api-error";

const schema = z.object({
  parentEmail: z.string().trim().toLowerCase().email().max(255),
  parentConsent: z.literal(true), immediateDelivery: z.literal(true),
  consentVersion: z.literal(PARENT_CONSENT_VERSION),
  locale: z.enum(["fr", "en"]), answers: juniorParentAnswersSchema,
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const limited = await rateLimit(request, 30, 60_000, "parent.status");
  return limited ?? parentBackend("request", undefined, request.headers.get("authorization") ?? "");
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const limited = await rateLimit(request, 3, 60_000, "parent.request");
  if (limited) return limited;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: "parent_request_invalid" }, { status: 422 });
  const db = createServiceClient();
  const profile = await db.from("profiles").select("prenom").eq("id", auth.userId).maybeSingle();
  if (profile.error) return internalError("parent.profile", profile.error);
  if (!profile.data?.prenom?.trim()) return NextResponse.json({ code: "parent_request_invalid" }, { status: 422 });
  const reserved = await reservePendingCommande(db, {
    userId: auth.userId, reponsesId: null, offre: JUNIOR_COMMANDE_OFFRE,
    amountCents: JUNIOR_AMOUNT_CENTS, locale: parsed.data.locale,
  });
  if ("error" in reserved) return internalError("parent.commande", reserved.error);
  return parentBackend("request", { ...parsed.data, firstName: profile.data.prenom, externalCommandId: reserved.commande.id }, request.headers.get("authorization") ?? "");
}
