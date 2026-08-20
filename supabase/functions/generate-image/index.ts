const ANIMAL_VISUALS: Record<string, { fr: string; en: string }> = {
  lion: { fr: "lion", en: "lion" },
  lionne: { fr: "lionne", en: "lioness" },
  rhinoceros: { fr: "rhinocéros", en: "rhinoceros" },
  crocodile: { fr: "crocodile", en: "crocodile" },
  serpent: { fr: "serpent", en: "serpent" },
  dauphin: { fr: "dauphin", en: "dolphin" },
  elephant: { fr: "éléphant", en: "elephant" },
  baobab: { fr: "baobab", en: "baobab" },
  zebre: { fr: "zèbre", en: "zebra" },
  perroquet: { fr: "perroquet", en: "parrot" },
  aigle: { fr: "aigle", en: "eagle" },
  leopard: { fr: "léopard", en: "leopard" },
};

function buildImagePrompt(archetypeId: string, langue: "fr" | "en", seed?: string): string {
  const visual = ANIMAL_VISUALS[archetypeId] ?? ANIMAL_VISUALS.lion;
  const seedParam = seed ? ` --seed ${numericSeed(seed)}` : "";
  const animal = visual[langue];
  const common = langue === "fr"
    ? `Masque Ngil Fang sculpte en bois, seul sujet de l'image, objet d'art premium qui evoque le ${animal} par ses volumes et ornements sans representer d'animal vivant, socle rituel noir et or, kaolin ivoire patine, grain naturel du bois, traces d'outil, or ancestral discret, accents ocre et indigo, ombres profondes, lumiere d'atelier museal, composition verticale 3:4, aucun etre humain, aucun visage humain, aucun portrait, aucune silhouette humaine, aucun corps animal, aucune moitie de visage, aucun collage, aucun texte, aucun logo, aucun watermark`
    : `Single hand-carved Fang Ngil wooden mask, the only subject, a premium art object evoking the ${animal} through sculpted volumes and ornaments without depicting a living animal, black-and-gold ritual pedestal, aged ivory kaolin, natural wood grain, visible hand tools, restrained ancestral gold, ochre and indigo accents, deep shadows, museum studio light, vertical 3:4 composition, no human, no human face, no portrait, no human silhouette, no animal body, no split face, no collage, no text, no logo, no watermark`;
  return `${common}${seedParam}`;
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
    const { archetypeId, langue = "fr", seed } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY non configurée" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (typeof archetypeId !== "string" || !ANIMAL_VISUALS[archetypeId]) {
      return new Response(JSON.stringify({ error: "archetypeId hors catalogue" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const l = (langue === "en" ? "en" : "fr") as "fr" | "en";
    const finalPrompt = buildImagePrompt(archetypeId, l, seed);

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
    };

    const b64Json = result.data?.[0]?.b64_json ?? "";
    if (!b64Json) {
      throw new Error("OpenAI n'a pas retourné d'image");
    }

    // Upload to storage
    const storageUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    let publicUrl = "";
    if (storageUrl && serviceKey) {
      const key = `totems/${crypto.randomUUID()}/image.png`;
      console.log(`Uploading to ${storageUrl}/storage/v1/object/totem-files/${key}`);
      const binaryString = atob(b64Json);
      const imgBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imgBytes[i] = binaryString.charCodeAt(i);
      }
      const uploadRes = await fetch(
        `${storageUrl}/storage/v1/object/totem-files/${key}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "image/png",
          },
          body: imgBytes,
        },
      );
      if (uploadRes.ok) {
        publicUrl = `${storageUrl}/storage/v1/object/public/totem-files/${key}`;
        console.log(`Upload OK: ${publicUrl}`);
      } else {
        const errText = await uploadRes.text().catch(() => "");
        console.error(`Upload failed ${uploadRes.status}: ${errText.slice(0, 300)}`);
      }
    } else {
      console.error(`Missing storage config: url=${!!storageUrl} key=${!!serviceKey}`);
    }

    return new Response(
      JSON.stringify({
        imageUrl: publicUrl,
        b64: b64Json,
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
