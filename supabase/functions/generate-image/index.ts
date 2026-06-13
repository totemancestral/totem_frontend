Deno.serve(async (req) => {
  try {
    const { prenom, texte, archetypeId, langue = "fr" } = await req.json();

    if (!texte) {
      return new Response(JSON.stringify({ error: "texte requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const senyceKey = Deno.env.get("SENYCE_API_KEY");
    const senyceEndpoint = Deno.env.get("SENYCE_API_IMAGE");

    if (!senyceKey || !senyceEndpoint) {
      return new Response(JSON.stringify({ error: "SENYCE non configuré" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(senyceEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${senyceKey}`,
      },
      body: JSON.stringify({ prenom, texte, archetype: archetypeId, langue }),
    });

    if (!response.ok) {
      throw new Error(`SENYCE API error: ${response.status}`);
    }

    const result = (await response.json()) as { imageUrl?: string; url?: string };
    const imageUrl = result.imageUrl ?? result.url ?? "";

    return new Response(JSON.stringify({ imageUrl }), {
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
