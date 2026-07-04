const VOICE_MAP: Record<string, string> = {
  A: "onyx",
  B: "sage",
  C: "nova",
  D: "shimmer",
  lion: "onyx",
  lionne: "nova",
  rhinoceros: "onyx",
  crocodile: "sage",
  serpent: "sage",
  dauphin: "shimmer",
  elephant: "onyx",
  baobab: "sage",
  zebre: "nova",
  perroquet: "shimmer",
  aigle: "onyx",
  leopard: "sage",
};

Deno.serve(async (req) => {
  try {
    const { prenom, texte, script, archetypeId, langue = "fr" } = await req.json();

    const finalText = typeof script === "string" && script.trim() ? script.trim() : texte;

    if (!finalText) {
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

    const voice = VOICE_MAP[archetypeId as string] ?? "nova";

    const intro =
      langue === "fr"
        ? `Message ancestral pour ${prenom}. Écoute la voix des ancêtres.`
        : `Ancestral message for ${prenom}. Listen to the voice of the ancestors.`;

    const fullText = `${intro}\n\n${finalText}`;
    const maxLen = 4096;

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: fullText.slice(0, maxLen),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`OpenAI TTS API error: ${response.status} ${errorBody}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const dataUrl = `data:audio/mp3;base64,${btoa(binary)}`;

    return new Response(JSON.stringify({ audioUrl: dataUrl }), {
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
