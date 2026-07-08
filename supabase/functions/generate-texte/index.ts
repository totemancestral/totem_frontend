const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
  lion: { fr: "Lion", en: "Lion" },
  lionne: { fr: "Lionne", en: "Lioness" },
  rhinoceros: { fr: "Rhinocéros", en: "Rhinoceros" },
  crocodile: { fr: "Crocodile", en: "Crocodile" },
  serpent: { fr: "Serpent", en: "Serpent" },
  dauphin: { fr: "Dauphin", en: "Dolphin" },
  elephant: { fr: "Éléphant", en: "Elephant" },
  baobab: { fr: "Baobab", en: "Baobab" },
  zebre: { fr: "Zèbre", en: "Zebra" },
  perroquet: { fr: "Perroquet", en: "Parrot" },
  aigle: { fr: "Aigle", en: "Eagle" },
  leopard: { fr: "Léopard", en: "Leopard" },
};

function normalizeLanguage(langue: unknown): "fr" | "en" {
  const raw = typeof langue === "string" ? langue.trim().toLowerCase() : "";
  if (!raw) return "fr";

  if (
    raw === "en" ||
    raw.startsWith("en-") ||
    raw === "english" ||
    raw === "anglais" ||
    raw === "anglaise"
  ) {
    return "en";
  }
  return "fr";
}

function extractChampsLibres(reponses: Record<string, unknown>): string {
  return Object.values(reponses)
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => (a as { field?: string }).field ?? "")
    .filter(Boolean)
    .join("\n");
}

function buildPrompt(
  prenom: string,
  archetype: string,
  champsLibres: string,
  langue: "fr" | "en",
): string {
  if (langue === "fr") {
    return `Tu es la plume artistique de TOTEM ANCESTRAL.

Tu vas composer le Parchemin Ancestral de ${prenom}.

Voici les réponses de son parcours initiatique (champs libres) :
${champsLibres || "Le voyageur n'a pas laissé de paroles."}

CONTEXTE :
Archétype : ${archetype}

STRUCTURE OBLIGATOIRE — 5 mouvements :
MOUVEMENT 1 — L'OUVERTURE (200-250 car.) : décor, lieu, heure de vie de l'ancêtre
MOUVEMENT 2 — LE PORTRAIT (350-400 car.) : apparence, geste, relation au peuple
MOUVEMENT 3 — L'ÉPREUVE (350-400 car.) : scène emblématique, inspirée de la culture
MOUVEMENT 4 — LA TRANSMISSION (300-350 car.) : ce que l'ancêtre a transmis
MOUVEMENT 5 — LE PASSAGE (250-300 car.) : adresse directe à ${prenom}

RÈGLES STRICTES :
- Total : 1500-1800 caractères espaces compris
- Conditionnel doux : "il aurait vécu", jamais "tu es" pour l'ancêtre
- Jamais de vérité scientifique ou ethnique : c'est une fable artistique
- Pas d'emojis, pas d'anglicismes, pas de texte marketing

RÉPONSE — Format JSON STRICT :
{
  "parchment_text": "Texte complet, 5 mouvements séparés par \\n\\n",
  "opening": "Mouvement 1 isolé",
  "portrait": "Mouvement 2 isolé",
  "trial": "Mouvement 3 isolé",
  "transmission": "Mouvement 4 isolé",
  "passage": "Mouvement 5 isolé",
  "character_count": 1650,
  "narrative_variant_used": "A"
}`;
  }

  return `You are the artistic writer of TOTEM ANCESTRAL.

Compose the Ancestral Parchment of ${prenom}.

Here are their initiatory journey answers (free text fields):
${champsLibres || "The traveler left no words."}

CONTEXT:
Archetype: ${archetype}

MANDATORY STRUCTURE — 5 movements:
MOVEMENT 1 — OPENING (200-250 chars): setting, place, hour of the ancestor's life
MOVEMENT 2 — PORTRAIT (350-400 chars): appearance, gesture, relation to the people
MOVEMENT 3 — TRIAL (350-400 chars): emblematic scene inspired by the culture
MOVEMENT 4 — TRANSMISSION (300-350 chars): what the ancestor passed on
MOVEMENT 5 — PASSAGE (250-300 chars): direct address to ${prenom}

STRICT RULES:
- Total: 1500-1800 characters including spaces
- Gentle conditional mode: "he would have lived", never "you are" for the ancestor
- No scientific or ethnic truth: this is an artistic fable
- No emojis, no marketing copy

RESPONSE — Strict JSON format:
{
  "parchment_text": "Full text, 5 movements separated by \\n\\n",
  "opening": "Movement 1 only",
  "portrait": "Movement 2 only",
  "trial": "Movement 3 only",
  "transmission": "Movement 4 only",
  "passage": "Movement 5 only",
  "character_count": 1650,
  "narrative_variant_used": "A"
}`;
}

function extractJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractParchmentText(raw: string): string {
  const parsed = extractJson(raw);
  if (typeof parsed?.parchment_text === "string" && parsed.parchment_text.trim()) {
    return parsed.parchment_text.trim();
  }
  return raw.trim();
}

function extractSections(raw: string, langue: "fr" | "en"): { title: string; text: string }[] | null {
  const parsed = extractJson(raw);
  if (!parsed || typeof parsed !== "object") return null;

  // Try new format: embedded sections array
  const root = parsed as Record<string, unknown>;
  if (Array.isArray(root.sections)) {
    const items = root.sections as { title?: string; text?: string; paragraphs?: string[] }[];
    if (items.length > 0) {
      return items.map((s) => ({
        title: s.title ?? "",
        text: s.text ?? s.paragraphs?.join("\n\n") ?? "",
      }));
    }
  }

  // Legacy format: individual movement keys
  const movementKeys = ["opening", "portrait", "trial", "transmission", "passage"];
  const movementTitles: Record<"fr" | "en", Record<string, string>> = {
    fr: {
      opening: "L'Ouverture",
      portrait: "Le Portrait",
      trial: "L'Épreuve",
      transmission: "La Transmission",
      passage: "Le Passage",
    },
    en: {
      opening: "Opening",
      portrait: "Portrait",
      trial: "Trial",
      transmission: "Transmission",
      passage: "Passage",
    },
  };

  const sections: { title: string; text: string }[] = [];
  for (const key of movementKeys) {
    if (typeof root[key] === "string") {
      const val = (root[key] as string).trim();
      if (val) sections.push({ title: movementTitles[langue][key], text: val });
    }
  }

  return sections.length > 0 ? sections : null;
}

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-5",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  return result.content?.[0]?.text?.trim() ?? "";
}

async function callSenyce(
  endpoint: string,
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`SENYCE API error: ${response.status}`);
  }

  const result = (await response.json()) as { texte?: string };
  return result.texte?.trim() ?? "";
}

function fallbackLocal(
  prenom: string,
  archetype: string,
  reponses: Record<string, unknown>,
  langue: "fr" | "en",
): string {
  const lines: string[] = [];
  for (const val of Object.values(reponses)) {
    if (!val || typeof val !== "object") continue;
    const answer = val as { choice?: string; field?: string };
    if (answer.field?.trim()) {
      lines.push(answer.field.trim());
    }
  }
  if (lines.length > 0) return lines.join("\n\n");
  return langue === "fr"
    ? `Totem Ancestral de ${prenom} — ${archetype}`
    : `Ancestral Totem of ${prenom} — ${archetype}`;
}

Deno.serve(async (req) => {
  try {
    const { prenom, reponses = {}, archetypeId, langue = "fr", prompt } = await req.json();

    if (!prenom) {
      return new Response(JSON.stringify({ error: "prenom requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const l = normalizeLanguage(langue);
    const archetype = ARCHETYPE_LABELS[archetypeId as string]?.[l] ?? "Griot";
    const champsLibres = extractChampsLibres(reponses as Record<string, unknown>);
    const finalPrompt =
      typeof prompt === "string" && prompt.trim()
        ? prompt
        : buildPrompt(prenom, archetype, champsLibres, l);

    let texte = "";
    let rawTexte = "";

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (anthropicKey) {
      try {
        rawTexte = await callClaude(anthropicKey, finalPrompt);
        texte = extractParchmentText(rawTexte);
      } catch (e) {
        console.error("Claude error:", e);
      }
    }

    if (!texte) {
      const senyceKey = Deno.env.get("SENYCE_API_KEY");
      const senyceEndpoint = Deno.env.get("SENYCE_API_TEXTE");
      if (senyceKey && senyceEndpoint) {
        try {
          rawTexte = await callSenyce(senyceEndpoint, senyceKey, {
            prenom,
            reponses,
            archetype: archetypeId,
            langue: l,
            prompt: finalPrompt,
          });
          texte = extractParchmentText(rawTexte);
        } catch (e) {
          console.error("SENYCE texte error:", e);
        }
      }
    }

    if (!texte) {
      texte = fallbackLocal(prenom, archetype, reponses as Record<string, unknown>, l);
      rawTexte = texte;
    }

    const sections = extractSections(rawTexte || texte, l);

    return new Response(
      JSON.stringify({
        texte,
        sections: sections ?? [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
