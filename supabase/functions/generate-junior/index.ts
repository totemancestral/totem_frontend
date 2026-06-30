type Choice = "A" | "B" | "C" | "D";
type Dim = "F" | "E" | "T" | "A";
type Scores = Record<Dim, number>;

const dims: Dim[] = ["F", "E", "T", "A"];
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const scoring: Record<number, Record<Choice, Scores>> = {
  1: {
    A: { F: 3, E: 0, T: 0, A: 1 },
    B: { F: 0, E: 3, T: 1, A: 0 },
    C: { F: 0, E: 1, T: 0, A: 3 },
    D: { F: 2, E: 0, T: 0, A: 2 },
  },
  2: {
    A: { F: 0, E: 1, T: 3, A: 0 },
    B: { F: 1, E: 0, T: 1, A: 3 },
    C: { F: 0, E: 3, T: 0, A: 1 },
    D: { F: 2, E: 0, T: 1, A: 2 },
  },
  3: {
    A: { F: 0, E: 2, T: 0, A: 2 },
    B: { F: 1, E: 0, T: 3, A: 0 },
    C: { F: 0, E: 0, T: 1, A: 3 },
    D: { F: 3, E: 1, T: 0, A: 0 },
  },
  4: {
    A: { F: 0, E: 2, T: 1, A: 1 },
    B: { F: 2, E: 0, T: 2, A: 0 },
    C: { F: 0, E: 1, T: 0, A: 3 },
    D: { F: 3, E: 1, T: 0, A: 0 },
  },
  5: {
    A: { F: 1, E: 0, T: 0, A: 3 },
    B: { F: 3, E: 0, T: 1, A: 0 },
    C: { F: 0, E: 0, T: 3, A: 1 },
    D: { F: 0, E: 3, T: 0, A: 1 },
  },
};

const attribution: Record<Dim, Record<Dim, string>> = {
  F: {
    A: "DAYO LE LION DU FEU",
    E: "ZARA LE LEOPARD DES OMBRES",
    T: "KOFI LE BUFFLE DES PLAINES",
    F: "AMARA LA LIONNE DES SAVANES",
  },
  E: {
    A: "KEMI LE SERPENT SAGE",
    T: "BAKARI LE CROCODILE ANCIEN",
    F: "AIDA LA PANTHERE NOIRE",
    E: "IMANI LA TORTUE ETERNELLE",
  },
  T: {
    F: "SEUN L'ELEPHANT GARDIEN",
    A: "NALA LA GRUE ROYALE",
    E: "IMANI LA TORTUE ETERNELLE",
    T: "SEUN L'ELEPHANT GARDIEN",
  },
  A: {
    F: "KWAME L'AIGLE DES CIMES",
    E: "FATOU LE FAUCON LIBRE",
    T: "KWAME L'AIGLE DES CIMES",
    A: "FATOU LE FAUCON LIBRE",
  },
};

const qualities: Record<string, string> = {
  "KWAME L'AIGLE DES CIMES": "Vision",
  "AMARA LA LIONNE DES SAVANES": "Protection",
  "ZARA LE LEOPARD DES OMBRES": "Precision",
  "KEMI LE SERPENT SAGE": "Sagesse",
  "SEUN L'ELEPHANT GARDIEN": "Memoire",
  "AIDA LA PANTHERE NOIRE": "Mystere",
  "KOFI LE BUFFLE DES PLAINES": "Endurance",
  "NALA LA GRUE ROYALE": "Grace",
  "BAKARI LE CROCODILE ANCIEN": "Longevite",
  "FATOU LE FAUCON LIBRE": "Liberte",
  "DAYO LE LION DU FEU": "Intensite",
  "IMANI LA TORTUE ETERNELLE": "Patience",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json();
    const firstName =
      typeof body?.firstName === "string" && body.firstName.trim()
        ? body.firstName.trim().slice(0, 40)
        : "Toi";
    const answers = isRecord(body?.answers) ? body.answers : {};
    const scores: Scores = { F: 0, E: 0, T: 0, A: 0 };

    for (let question = 1; question <= 5; question += 1) {
      const choice = answers[String(question)]?.choice as Choice | undefined;
      if (!choice || !scoring[question]?.[choice]) {
        return json({ error: "Les cinq reponses Junior sont requises" }, 422);
      }
      for (const dim of dims) scores[dim] += scoring[question][choice][dim];
    }

    const sorted = dims
      .map((dim) => ({ dim, score: scores[dim] }))
      .sort((left, right) => right.score - left.score);
    const dominant = sorted[0].dim;
    const secondary = sorted.find((item) => item.dim !== dominant)?.dim ?? dominant;
    const totem = attribution[dominant][secondary] ?? attribution[dominant][dominant];
    const quality = qualities[totem] ?? "Presence";

    return json({
      type: "junior",
      firstName,
      scores,
      dominant,
      secondary,
      totem: { name: totem, quality },
      phrase: `Avant toi, un ancetre portait ${qualityPhrase(quality)} dans son geste, et ce signe avance maintenant avec ton nom.`,
      caption: `${totem}\nQuel ancetre dort en toi ?\n#RevealYourTotem`,
      messageDefi: `J'ai decouvert mon totem ancestral : ${totem}. Toi, tu es quoi ? totemancestral.com`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return json({ error: message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, Record<string, unknown>> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function qualityPhrase(quality: string) {
  const phrases: Record<string, string> = {
    Vision: "la vision",
    Protection: "la protection",
    Precision: "la precision",
    Sagesse: "la sagesse",
    Memoire: "la memoire",
    Mystere: "le mystere",
    Endurance: "l'endurance",
    Grace: "la grace",
    Longevite: "la longevite",
    Liberte: "la liberte",
    Intensite: "l'intensite",
    Patience: "la patience",
  };

  return phrases[quality] ?? quality.toLowerCase();
}
