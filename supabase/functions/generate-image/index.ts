const ANIMAL_VISUALS: Record<string, { fr: string; en: string }> = {
  lion: {
    fr: "lion réaliste avec crinière noire et regard perçant",
    en: "realistic lion with a black mane and piercing gaze",
  },
  lionne: {
    fr: "lionne réaliste avec regard protecteur et traits royaux",
    en: "realistic lioness with a protective gaze and royal features",
  },
  rhinoceros: {
    fr: "rhinocéros réaliste avec corne sculpturale et peau minérale",
    en: "realistic rhinoceros with a sculptural horn and mineral skin",
  },
  crocodile: {
    fr: "crocodile réaliste avec écailles profondes et regard ancien",
    en: "realistic crocodile with deep scales and ancient gaze",
  },
  serpent: {
    fr: "serpent réaliste avec écailles vert sombre et regard hypnotique",
    en: "realistic serpent with dark green scales and hypnotic gaze",
  },
  dauphin: {
    fr: "dauphin réaliste avec peau bleutée et regard lumineux",
    en: "realistic dolphin with bluish skin and luminous gaze",
  },
  elephant: {
    fr: "éléphant réaliste avec défenses sculpturales et regard ancestral",
    en: "realistic elephant with sculptural tusks and ancestral gaze",
  },
  baobab: {
    fr: "baobab réaliste avec écorce massive et racines sculptées",
    en: "realistic baobab with massive bark and carved roots",
  },
  zebre: {
    fr: "zèbre réaliste avec rayures nettes et regard calme",
    en: "realistic zebra with sharp stripes and a calm gaze",
  },
  perroquet: {
    fr: "perroquet réaliste avec plumage vert et or et regard vif",
    en: "realistic parrot with green and gold plumage and a vivid gaze",
  },
  aigle: {
    fr: "aigle réaliste avec bec royal et regard perçant",
    en: "realistic eagle with a royal beak and piercing gaze",
  },
  leopard: {
    fr: "léopard réaliste avec taches sombres et regard précis",
    en: "realistic leopard with dark rosettes and a precise gaze",
  },
};

function buildImagePrompt(archetypeId: string, langue: "fr" | "en", seed?: string): string {
  const visual = ANIMAL_VISUALS[archetypeId];
  const seedParam = seed ? ` --seed ${numericSeed(seed)}` : "";
  const leftFace = visual?.[langue] ?? `${archetypeId} réaliste`;

  if (langue === "fr") {
    return `Portrait ancestral puissant, visage coupé en deux : moitié gauche visage de ${leftFace}, réaliste perçant, moitié droite masque Ngil Fang traditionnel africain stylisé avec yeux blancs et motifs géométriques, fusion harmonieuse au milieu du visage, peau avec cicatrices rituelles dorées, ambiance sombre mystique, éclairage dramatique cinématographique, style artistique premium africain, très détaillé, haute résolution, 8k --ar 3:4 --stylize 250 --v 6${seedParam}`;
  }

  return `Powerful ancestral portrait, split face: left half ${leftFace}, piercing gaze, right half stylized traditional African Fang Ngil mask with white eyes and geometric patterns, harmonious fusion at the center of the face, skin with golden ritual scarifications, dark mystical atmosphere, dramatic cinematic lighting, premium African artistic style, very detailed, high resolution, 8k --ar 3:4 --stylize 250 --v 6${seedParam}`;
}

function numericSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

Deno.serve(async (req) => {
  try {
    const { archetypeId, langue = "fr", prompt, seed } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY non configurée" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const providedPrompt = typeof prompt === "string" ? prompt.trim() : "";

    if (!archetypeId && !providedPrompt) {
      return new Response(JSON.stringify({ error: "archetypeId ou prompt requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const l = (langue === "en" ? "en" : "fr") as "fr" | "en";
    const finalPrompt = providedPrompt || buildImagePrompt(archetypeId, l, seed);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-2",
        prompt: finalPrompt,
        n: 1,
        size: "1024x1360",
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
      JSON.stringify({
        imageUrl: finalUrl,
        prompt: finalPrompt,
        revisedPrompt: result.data?.[0]?.revised_prompt,
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
