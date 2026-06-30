const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
  A: { fr: "Guerrier", en: "Warrior" },
  B: { fr: "Sage", en: "Sage" },
  C: { fr: "Gardien", en: "Guardian" },
  D: { fr: "Visionnaire", en: "Visionary" },
};

function buildImagePrompt(
  prenom: string,
  texte: string,
  archetype: string,
  langue: "fr" | "en",
): string {
  if (langue === "fr") {
    return `Illustration mystique et ancestrale pour un parchemin spirituel.

Contexte : Ce parchemin raconte l'histoire initiatique de ${prenom}, dont l'archétype ancestral est "${archetype}".

Texte du parchemin :
"${texte.slice(0, 500)}"

Style :
- Art africain contemporain mêlé de symbolisme mystique
- Palette terreuse (ocre, indigo, or, ivoire)
- Motifs géométriques sacrés et symboles ancestraux
- Ambiance spirituelle, intemporelle, solennelle
- Format portrait, aspect mystique et noble
- Peinture numérique avec textures rappelant le papier parchemin vieilli
- Pas de texte visible dans l'image
- L'image doit évoquer la sagesse, la mémoire des ancêtres et le destin`;
  }

  return `Mystical and ancestral illustration for a spiritual parchment.

Context: This parchment tells the initiatory story of ${prenom}, whose ancestral archetype is "${archetype}".

Parchment text:
"${texte.slice(0, 500)}"

Style:
- Contemporary African art blended with mystical symbolism
- Earthy palette (ochre, indigo, gold, ivory)
- Sacred geometric patterns and ancestral symbols
- Spiritual, timeless, solemn atmosphere
- Portrait format, mystical and noble feel
- Digital painting with aged parchment paper textures
- No visible text in the image
- The image should evoke wisdom, ancestral memory, and destiny`;
}

Deno.serve(async (req) => {
  try {
    const { prenom, texte, archetypeId, langue = "fr", prompt } = await req.json();

    if (!texte) {
      return new Response(JSON.stringify({ error: "texte requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY non configurée" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const l = (langue === "en" ? "en" : "fr") as "fr" | "en";
    const archetype = ARCHETYPE_LABELS[archetypeId as string]?.[l] ?? "Griot";
    const finalPrompt =
      typeof prompt === "string" && prompt.trim()
        ? prompt
        : buildImagePrompt(prenom, texte, archetype, l);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: finalPrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    const result = (await response.json()) as {
      data?: { b64_json?: string; url?: string; revised_prompt?: string }[];
      output_format?: string;
    };

    const imageUrl = result.data?.[0]?.url ?? "";
    const b64 = result.data?.[0]?.b64_json ?? "";
    const format = result.output_format ?? "png";

    if (!imageUrl && !b64) {
      throw new Error("OpenAI n'a pas retourné d'image");
    }

    const finalUrl = imageUrl || `data:image/${format};base64,${b64}`;

    return new Response(
      JSON.stringify({ imageUrl: finalUrl, revisedPrompt: result.data?.[0]?.revised_prompt }),
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
