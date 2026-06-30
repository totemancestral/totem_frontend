const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
  A: { fr: "Guerrier", en: "Warrior" },
  B: { fr: "Sage", en: "Sage" },
  C: { fr: "Gardien", en: "Guardian" },
  D: { fr: "Visionnaire", en: "Visionary" },
};

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
    return `Tu es un griot africain ancestral, un conteur des temps anciens. Rédige un parchemin mystique et poétique pour ${prenom}, dont l'archétype ancestral est "${archetype}".

Voici les réponses de son parcours initiatique (champs libres) :
${champsLibres || "Le voyageur n'a pas laissé de paroles."}

Le parchemin doit être :
- Mystérieux et envoûtant, comme une prophétie ancestrale
- Rédigé dans un français poétique et soutenu
- Personnel, adressé directement à ${prenom}
- Environ 200-300 mots
- Parler de son archétype ${archetype}, de sa lignée, de son destin
- Ne pas mentionner que c'est une IA qui écrit

Écris uniquement le texte du parchemin, sans titre, sans signature.`;
  }

  return `You are an ancestral African griot, a storyteller from ancient times. Write a mystical and poetic parchment for ${prenom}, whose ancestral archetype is "${archetype}".

Here are their initiatory journey answers (free text fields):
${champsLibres || "The traveler left no words."}

The parchment must be:
- Mysterious and enchanting, like an ancestral prophecy
- Written in poetic, elevated English
- Personal, addressed directly to ${prenom}
- About 200-300 words
- Speak of their ${archetype} archetype, their lineage, their destiny
- Do not mention it's an AI writing

Write only the parchment text, no title, no signature.`;
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

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
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
): string {
  const lines: string[] = [];
  for (const val of Object.values(reponses)) {
    if (!val || typeof val !== "object") continue;
    const answer = val as { choice?: string; field?: string };
    if (answer.field?.trim()) {
      lines.push(answer.field.trim());
    }
  }
  return lines.length > 0 ? lines.join("\n\n") : `Totem Ancestral de ${prenom} — ${archetype}`;
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

    const l = (langue === "en" ? "en" : "fr") as "fr" | "en";
    const archetype = ARCHETYPE_LABELS[archetypeId as string]?.[l] ?? "Griot";
    const champsLibres = extractChampsLibres(reponses as Record<string, unknown>);
    const finalPrompt =
      typeof prompt === "string" && prompt.trim()
        ? prompt
        : buildPrompt(prenom, archetype, champsLibres, l);

    let texte = "";

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (anthropicKey) {
      try {
        texte = extractParchmentText(await callClaude(anthropicKey, finalPrompt));
      } catch (e) {
        console.error("Claude error:", e);
      }
    }

    if (!texte) {
      const senyceKey = Deno.env.get("SENYCE_API_KEY");
      const senyceEndpoint = Deno.env.get("SENYCE_API_TEXTE");
      if (senyceKey && senyceEndpoint) {
        try {
          texte = await callSenyce(senyceEndpoint, senyceKey, {
            prenom,
            reponses,
            archetype: archetypeId,
            langue: l,
            prompt: finalPrompt,
          });
          texte = extractParchmentText(texte);
        } catch (e) {
          console.error("SENYCE texte error:", e);
        }
      }
    }

    if (!texte) {
      texte = fallbackLocal(prenom, archetype, reponses as Record<string, unknown>);
    }

    return new Response(JSON.stringify({ texte }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
