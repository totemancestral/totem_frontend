import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
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
  const rateLimitResponse = rateLimit(request, 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = juniorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Profil Junior invalide" }, { status: 422 });
  }

  const completed = countJuniorAnswers(parsed.data.answers);
  if (completed !== 5) {
    return NextResponse.json({ error: "Les cinq reponses Junior sont requises" }, { status: 422 });
  }

  try {
    return await handleJuniorGeneration(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur generation junior";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleJuniorGeneration(data: z.infer<typeof juniorSchema>) {
  const seed = crypto.randomUUID();
  let profile = createJuniorTotemProfile({
    firstName: data.firstName,
    answers: data.answers,
    seed,
  });

  let bundle = buildJuniorPromptBundle({ profile, answers: data.answers });
  let nomComplet = profile.nomComplet;
  let phrase = bundle.fallback.phrase;
  let attribut = bundle.fallback.attribut;
  let messageClan = bundle.fallback.messageClan;
  let caption = bundle.fallback.caption;
  let messageDefi = bundle.fallback.messageDefi;

  const env = getServerEnv();
  if (env.ANTHROPIC_API_KEY) {
    const aiProfile = await generateJuniorWithClaude(
      env.ANTHROPIC_API_KEY,
      profile,
      data.answers,
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

  return NextResponse.json({
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
    share: {
      caption,
      messageDefi,
    },
  });
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

  return {
    profile,
    bundle: refreshedBundle,
    nomComplet,
    phrase,
    attribut,
    messageClan,
    caption,
    messageDefi,
  };
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
        model:
          process.env.ANTHROPIC_MODEL_JUNIOR || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return null;

    const result = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };

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

function countJuniorAnswers(answers: Record<string, { choice: "A" | "B" | "C" | "D" }>) {
  return Array.from({ length: 5 }, (_, index) => answers[String(index + 1)]?.choice).filter(Boolean)
    .length;
}
