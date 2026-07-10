import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";
import {
  buildJuniorPromptBundle,
  createJuniorTotemProfile,
  extractStrictJson,
  type JuniorTotemProfile,
} from "@/lib/totem-v3";


const answerSchema = z.object({
  choice: z.enum(["A", "B", "C", "D"]),
});

const juniorSchema = z.object({
  firstName: z.string().trim().max(40).optional(),
  answers: z.record(z.string(), answerSchema),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const rateLimitResponse = rateLimit(request, 10, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requete invalide" }, { status: 422 });
    }

    const env = getServerEnv();

    const typed = body as { locale?: string };
    const locale = typed.locale === "en" ? "en" : "fr";

    const origin = (
      request.headers.get("origin") ||
      env.NEXT_PUBLIC_SITE_URL ||
      env.SITE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_JUNIOR) {
      return NextResponse.json(
        { error: "Le paiement junior n'est pas configure" },
        { status: 503 },
      );
    }

    const parsed = juniorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Profil Junior invalide" }, { status: 422 });
    }

    const completed = countJuniorAnswers(parsed.data.answers);
    if (completed !== 5) {
      return NextResponse.json({ error: "Les cinq reponses Junior sont requises" }, { status: 422 });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: env.STRIPE_PRICE_JUNIOR, quantity: 1 }],
      customer_email: auth.email,
      success_url: `${origin}${pagePath(locale, "junior", "checkout=success&session_id={CHECKOUT_SESSION_ID}")}`,
      cancel_url: `${origin}${pagePath(locale, "junior", "checkout=cancelled")}`,
      metadata: {
        userId: auth.userId,
        email: auth.email,
        offer: "junior",
      },
    });

    const seed = crypto.randomUUID();
    let profile = createJuniorTotemProfile({
      firstName: parsed.data.firstName,
      answers: parsed.data.answers,
      seed,
    });

    let bundle = buildJuniorPromptBundle({ profile, answers: parsed.data.answers });
    let nomComplet = profile.nomComplet;
    let phrase = bundle.fallback.phrase;
    let attribut = bundle.fallback.attribut;
    let messageClan = bundle.fallback.messageClan;
    let caption = bundle.fallback.caption;
    let messageDefi = bundle.fallback.messageDefi;

    if (env.ANTHROPIC_API_KEY) {
      const aiProfile = await generateJuniorWithClaude(
        env.ANTHROPIC_API_KEY,
        profile,
        parsed.data.answers,
      );
      profile = aiProfile.profile;
      bundle = aiProfile.bundle;
      nomComplet = aiProfile.nomComplet;
      phrase = aiProfile.phrase;
      attribut = aiProfile.attribut;
      messageClan = aiProfile.messageClan;
      caption = aiProfile.caption;
      messageDefi = aiProfile.messageDefi;
    }

    let reveal: {
      type: "junior";
      seed: string;
      orderNumber: number;
      firstName?: string;
      scores: Record<string, number>;
      dominant: string;
      secondary: string;
      totem: { name: string; animal: string; colors: string[]; quality: string };
      nomComplet: string;
      phrase: string;
      attribut: string;
      messageClan: string;
      share: { caption: string; messageDefi: string };
      imageUrl?: string;
      pdfUrl?: string;
      audioUrl?: string;
    } = {
      type: "junior",
      seed,
      orderNumber: profile.orderNumber,
      firstName: profile.firstName,
      scores: profile.scores,
      dominant: profile.dominant,
      secondary: profile.secondary,
      totem: profile.totem,
      nomComplet,
      phrase,
      attribut,
      messageClan,
      share: { caption, messageDefi },
    };

    let oeuvreId: string | null = null;

    // Créer la commande et l'oeuvre dans la base
    try {
      const serviceSupabase = createServiceClient();
      const now = new Date().toISOString();

      // Commande (offre "essentiel" car l'enum Supabase ne supporte pas "junior")
      await serviceSupabase.from("commandes").insert({
        user_id: auth.userId,
        offre: "essentiel",
        statut: "paye",
        montant_cents: 999,
        devise: "eur",
        langue: locale,
        stripe_session_id: session.id,
        created_at: now,
      });

      // Oeuvre
      const { data: inserted } = await serviceSupabase
        .from("oeuvres")
        .insert({
          user_id: auth.userId,
          commande_id: `junior_${session.id}`,
          nom_totem: nomComplet,
          statut: "en_generation",
          recit: phrase,
          numero_serie: String(profile.orderNumber).padStart(6, "0"),
          metadata: reveal,
        })
        .select("id")
        .single();
      oeuvreId = inserted?.id ?? null;
    } catch {
      // Échec silencieux
    }

    // Générer l'image et le PDF via le backend NestJS
    if (oeuvreId && env.TOTEM_BACKEND_URL) {
      try {
        const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
        const authorization = request.headers.get("authorization") ?? "";
        const response = await fetch(`${backendUrl}/junior/reveal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
          },
          body: JSON.stringify({
            oeuvreId,
            userId: auth.userId,
            firstName: profile.firstName || "Voyageur",
            nomComplet,
            phrase,
            attribut,
            messageClan,
            orderNumber: profile.orderNumber,
            locale,
          }),
        });
        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data) {
            reveal.imageUrl = data.imageUrl ?? data.image_url ?? undefined;
            reveal.pdfUrl = data.pdfUrl ?? data.pdf_url ?? undefined;
          }
        }
      } catch {
        // Échec silencieux — le résultat texte est déjà disponible
      }
    }

    // Mettre le statut à "livree" (même sans image, le texte est valide)
    if (oeuvreId) {
      try {
        const serviceSupabase = createServiceClient();
        await serviceSupabase.from("oeuvres").update({ statut: "livree" }).eq("id", oeuvreId);
      } catch {
        // Silencieux
      }
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
      reveal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function countJuniorAnswers(answers: Record<string, { choice: "A" | "B" | "C" | "D" }>) {
  return Array.from({ length: 5 }, (_, index) => answers[String(index + 1)]?.choice).filter(Boolean)
    .length;
}

async function generateJuniorWithClaude(
  apiKey: string,
  initialProfile: JuniorTotemProfile,
  answers: Record<string, { choice: "A" | "B" | "C" | "D" }>,
) {
  let profile = initialProfile;
  let bundle = buildJuniorPromptBundle({ profile, answers });
  let nomComplet = profile.nomComplet;
  let phrase = bundle.fallback.phrase;
  let attribut = bundle.fallback.attribut;
  let messageClan = bundle.fallback.messageClan;
  let caption = bundle.fallback.caption;
  let messageDefi = bundle.fallback.messageDefi;

  const j1 = await callClaudeJson(apiKey, bundle.promptJ1, 400);
  const aiName = readString(j1, "nom_complet");
  if (aiName) {
    nomComplet = aiName;
    profile = { ...profile, nomComplet };
    bundle = buildJuniorPromptBundle({ profile, answers });
  }

  const j2 = await callClaudeJson(apiKey, bundle.promptJ2, 400);
  phrase = readString(j2, "phrase") || phrase;

  const j3 = await callClaudeJson(apiKey, bundle.promptJ3, 400);
  attribut = readString(j3, "attribut") || attribut;
  messageClan = readString(j3, "message_clan") || messageClan;

  const refreshedBundle = buildJuniorPromptBundle({ profile, answers });
  const j4 = await callClaudeJson(
    apiKey,
    refreshedBundle.promptJ4
      .replace(bundle.fallback.phrase, phrase)
      .replace(bundle.fallback.attribut, attribut),
    500,
  );
  caption = readString(j4, "caption") || caption;
  messageDefi = readString(j4, "message_defi") || messageDefi;

  return { profile, bundle: refreshedBundle, nomComplet, phrase, attribut, messageClan, caption, messageDefi };
}

async function callClaudeJson(
  apiKey: string,
  prompt: string,
  maxTokens: number,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL_JUNIOR || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return null;

    const result = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = result.content?.[0]?.text ?? "";
    return extractStrictJson(text);
  } catch {
    return null;
  }
}

function readString(payload: Record<string, unknown> | null, key: string) {
  const value = payload?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
