import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";
import { JUNIOR_AMOUNT_CENTS, JUNIOR_COMMANDE_OFFRE } from "@/lib/offers";

const answerSchema = z.object({
  choice: z.enum(["A", "B", "C", "D"]),
});

const juniorSchema = z.object({
  firstName: z.string().trim().max(40).optional(),
  sexe: z.enum(["homme", "femme"]).nullish(),
  answers: z
    .object({
      "1": answerSchema,
      "2": answerSchema,
      "3": answerSchema,
      "4": answerSchema,
      "5": answerSchema,
    })
    .strict(),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const rateLimitResponse = await rateLimit(request, 10, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const parsed = juniorSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Profil Junior invalide" }, { status: 422 });
    }


    const env = getServerEnv();
    if (!env.TOTEM_BACKEND_URL) {
      return NextResponse.json(
        { error: "Le moteur de paiement n'est pas disponible. Réessaie dans un instant." },
        { status: 503 },
      );
    }

    const locale = parsed.data.locale === "en" ? "en" : "fr";
    const origin = (env.NEXT_PUBLIC_SITE_URL || env.SITE_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

    const supabase = createServiceClient();
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .insert({
        user_id: auth.userId,
        offre: JUNIOR_COMMANDE_OFFRE,
        statut: "en_attente_paiement",
        montant_cents: JUNIOR_AMOUNT_CENTS,
        devise: "EUR",
        langue: locale,
      })
      .select("id")
      .single();

    if (commandeError || !commande) {
      return NextResponse.json({ error: "Erreur préparation commande" }, { status: 500 });
    }

    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    try {
      const backendResponse = await fetch(`${backendUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization") ?? "",
        },
        body: JSON.stringify({
          offer: "junior",
          externalCommandId: commande.id,
          firstName: parsed.data.firstName,
          answers: parsed.data.answers,
          locale,
          successUrl: `${origin}/${locale}/domus_animi?checkout=success&session_id={CHECKOUT_SESSION_ID}&type=junior`,
          cancelUrl: `${origin}${pagePath(locale, "junior", "checkout=cancelled")}`,
        }),
      });

      const backendPayload = (await backendResponse.json().catch(() => null)) as {
        id?: string;
        url?: string | null;
      } | null;

      if (backendResponse.ok && backendPayload?.url) {
        return NextResponse.json({
          checkoutUrl: backendPayload.url,
          checkoutSessionId: backendPayload.id,
          commandeId: commande.id,
        });
      }

      console.error(
        `[iuvenis_signum/checkout] Backend checkout failed (${backendResponse.status})`,
        backendPayload,
      );
      return NextResponse.json(
        {
          error:
            "Le paiement est temporairement indisponible. Aucun débit n'a été effectué. Réessaie dans un instant.",
        },
        { status: backendResponse.status >= 400 ? backendResponse.status : 502 },
      );
    } catch (err) {
      console.error("[iuvenis_signum/checkout] Backend fetch failed:", err);
      return NextResponse.json(
        {
          error:
            "Le moteur de paiement est injoignable. Aucun débit n'a été effectué. Réessaie dans un instant.",
        },
        { status: 503 },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
