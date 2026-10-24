import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";
import { adultDraftSchema, hasAdultAnswersThrough, ADULT_QUESTION_COUNT } from "@/lib/adult-flow";
import { adultIndicators, toAdultBackendAnswers } from "@/lib/adult-answers";
import { readAdultDraft, readAdultPayment } from "@/lib/server/adult-parcours";
import { getServerEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { forwardRetryResponse } from "@/lib/server/response-limits";
import type { Json } from "@/lib/supabase/types";

const schema = z.object({ parcoursId: z.uuid(), sessionId: z.string().min(1).max(255), answers: adultDraftSchema, locale: z.enum(["fr", "en"]) });

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;
    const limited = await rateLimit(request, 10, 60_000, "orders.complete");
    if (limited) return limited;
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success || !hasAdultAnswersThrough(parsed.data.answers, ADULT_QUESTION_COUNT)) {
      return NextResponse.json({ error: "adult_answers_incomplete" }, { status: 422 });
    }
    const { parcoursId, sessionId, answers, locale } = parsed.data;
    const draft = await readAdultDraft(auth.userId, parcoursId, sessionId);
    if (!draft?.command) return NextResponse.json({ error: "parcours_not_found" }, { status: 404 });
    const payment = await readAdultPayment(request, sessionId);
    if (payment instanceof NextResponse) return payment;
    if (!payment.paid) return NextResponse.json({ error: "payment_required" }, { status: 402 });
    if (draft.termine) return NextResponse.json({ completed: true, sessionId });

    const db = createServiceClient();
    const { data: profile, error: profileError } = await db.from("profiles").select("sexe").eq("id", auth.userId).maybeSingle();
    if (profileError) throw profileError;
    const backendAnswers = toAdultBackendAnswers(answers, true);
    if (profile?.sexe === "homme" || profile?.sexe === "femme") backendAnswers.push({ questionId: "sexe", answer: profile.sexe });
    // Conserver les réponses même si l'appel au moteur doit être réessayé.
    const { error: saveError } = await db.from("reponses_parcours").update({ reponses: answers as Json, langue: locale })
      .eq("id", parcoursId).eq("user_id", auth.userId).eq("termine", false);
    if (saveError) throw saveError;
    const backendUrl = getServerEnv().TOTEM_BACKEND_URL!.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/orders/complete`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") ?? "" },
      body: JSON.stringify({ externalCommandId: draft.command.id, answers: backendAnswers, locale, questionnaireVersion: "griot-v2", indicators: adultIndicators(answers) }),
    });
    const backendLimit = forwardRetryResponse(response);
    if (backendLimit) return backendLimit;
    if (!response.ok) return NextResponse.json({ error: "completion_failed" }, { status: response.status });
    const { error } = await db.from("reponses_parcours").update({ termine: true })
      .eq("id", parcoursId).eq("user_id", auth.userId);
    if (error) throw error;
    return NextResponse.json({ completed: true, sessionId });
  } catch (error) { return internalError("orders.complete.POST", error); }
}
