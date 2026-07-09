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
  const animal = visual?.[langue] ?? (langue === "fr" ? `${archetypeId} réaliste` : `realistic ${archetypeId}`);

  if (langue === "fr") {
    return `Sculpture totemique ancestrale premium, statue complete de ${animal}, sujet unique centre sur socle rituel noir et or, ornements geometriques africains ciselés, matiere ebene et dorure ancienne, tete du totem fusionnee en deux : moitie gauche visage animal realiste, moitie droite masque Ngil Fang stylise avec motifs geometriques et yeux blancs, fusion harmonieuse sur l'axe central du visage, arriere-plan sombre mystique, eclairage cinematographique dramatique, tres detaille, rendu musee, haute resolution 8k, aucun humain, aucun buste humain, aucun torse humain, aucun personnage --ar 3:4 --stylize 250 --v 6${seedParam}`;
  }

  return `Premium ancestral totem sculpture, full-body statue of a ${animal}, single centered subject on a ritual black-and-gold pedestal, engraved African geometric ornaments, ebony-like material with ancient golden inlays, split-face fusion on the totem head: left half realistic animal face, right half stylized Fang Ngil mask with white eyes and geometric motifs, seamless central merge, dark mystical background, dramatic cinematic lighting, museum-grade render, ultra-detailed, high resolution 8k, no human, no human bust, no human torso, no person --ar 3:4 --stylize 250 --v 6${seedParam}`;
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
