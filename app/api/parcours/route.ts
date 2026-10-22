import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";
import { adultDraftSchema, PAYMENT_AFTER_QUESTION } from "@/lib/adult-flow";
import { readAdultDraft, readAdultPayment } from "@/lib/server/adult-parcours";
import { rateLimit } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/types";

const locatorSchema = z.object({
  parcoursId: z.uuid().optional(),
  sessionId: z.string().min(1).max(255).optional(),
});
const saveSchema = locatorSchema.extend({ answers: adultDraftSchema, locale: z.enum(["fr", "en"]) });

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;
    const url = new URL(request.url);
    const parsed = locatorSchema.safeParse({
      parcoursId: url.searchParams.get("parcoursId") ?? undefined,
      sessionId: url.searchParams.get("session_id") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: "invalid_parcours" }, { status: 422 });
    const draft = await readAdultDraft(auth.userId, parsed.data.parcoursId, parsed.data.sessionId);
    if (!draft) {
      if (parsed.data.parcoursId || parsed.data.sessionId) return NextResponse.json({ error: "parcours_not_found" }, { status: 404 });
      return NextResponse.json({ parcoursId: null, answers: {}, paid: false });
    }
    const sessionId = draft.command?.stripe_session_id;
    const payment = sessionId ? await readAdultPayment(request, sessionId) : null;
    if (payment instanceof NextResponse) return payment;
    return NextResponse.json({
      parcoursId: draft.id, answers: draft.reponses, completed: draft.termine,
      sessionId, commandeId: draft.command?.id, paid: payment?.paid === true,
      offer: payment?.offer, status: payment?.status,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return internalError("parcours.GET", error); }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;
    const limited = await rateLimit(request, 60, 60_000, "parcours");
    if (limited) return limited;
    const parsed = saveSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "invalid_answers" }, { status: 422 });
    const { answers, locale, parcoursId, sessionId } = parsed.data;
    const draft = parcoursId || sessionId ? await readAdultDraft(auth.userId, parcoursId, sessionId) : null;
    if ((parcoursId || sessionId) && !draft) return NextResponse.json({ error: "parcours_not_found" }, { status: 404 });
    if (draft?.termine) return NextResponse.json({ error: "parcours_completed" }, { status: 409 });
    if (Object.keys(answers).some((key) => Number(key) > PAYMENT_AFTER_QUESTION)) {
      const stripeSession = draft?.command?.stripe_session_id;
      if (!stripeSession) return NextResponse.json({ error: "payment_required" }, { status: 402 });
      const payment = await readAdultPayment(request, stripeSession);
      if (payment instanceof NextResponse) return payment;
      if (!payment.paid) return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
    const db = createServiceClient();
    const fields = { reponses: answers as Json, langue: locale, termine: false };
    const query = draft
      ? db.from("reponses_parcours").update(fields).eq("id", draft.id).eq("user_id", auth.userId).eq("termine", false)
      : db.from("reponses_parcours").insert({ ...fields, user_id: auth.userId, session_id: randomUUID() });
    const { data, error } = await query.select("id").single();
    if (error) return internalError("parcours.POST.save", error);
    return NextResponse.json({ parcoursId: data.id });
  } catch (error) { return internalError("parcours.POST", error); }
}
