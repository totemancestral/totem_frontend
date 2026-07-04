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

const totemDetails: Record<
  string,
  { animal: string; colors: string[]; identitySeed: string; titleSeries: string[] }
> = {
  "KWAME L'AIGLE DES CIMES": {
    animal: "Aigle",
    colors: ["or", "bleu nuit", "blanc"],
    identitySeed: "Avant toi, un ancetre regardait l'horizon et voyait demain.",
    titleSeries: ["Qui vit dans l'Eclair", "Des Sommets Silencieux", "Qui porte le Soleil"],
  },
  "AMARA LA LIONNE DES SAVANES": {
    animal: "Lionne",
    colors: ["ocre", "rouge terre", "or"],
    identitySeed: "Avant toi, une ancetre tenait debout ce que le vent voulait renverser.",
    titleSeries: ["Du Feu Originel", "Qui garde la Flamme", "Du Premier Matin"],
  },
  "ZARA LE LEOPARD DES OMBRES": {
    animal: "Leopard",
    colors: ["noir", "or", "vert foret"],
    identitySeed: "Avant toi, un ancetre attendait dans le silence pour agir dans la lumiere.",
    titleSeries: ["Des Ombres Profondes", "Qui frappe dans le Silence", "Qui attend l'Heure Juste"],
  },
  "KEMI LE SERPENT SAGE": {
    animal: "Serpent royal",
    colors: ["vert profond", "noir", "argent"],
    identitySeed: "Avant toi, une ancetre lisait les secrets que la terre murmure.",
    titleSeries: ["Qui lit les Eaux", "Des Profondeurs Anciennes", "Qui transforme tout"],
  },
  "SEUN L'ELEPHANT GARDIEN": {
    animal: "Elephant",
    colors: ["gris ardoise", "terre rouge", "or"],
    identitySeed: "Avant toi, un ancetre portait la memoire de tous ceux qui etaient partis.",
    titleSeries: ["Qui porte la Memoire", "Des Racines Profondes", "Des Ancetres Debout"],
  },
  "AIDA LA PANTHERE NOIRE": {
    animal: "Panthere",
    colors: ["noir", "violet", "or"],
    identitySeed: "Avant toi, une ancetre marchait entre deux mondes sans jamais choisir.",
    titleSeries: ["Ne entre Deux Mondes", "Ne dans le Mystere", "Des Passages Caches"],
  },
  "KOFI LE BUFFLE DES PLAINES": {
    animal: "Buffle",
    colors: ["marron profond", "rouge", "noir"],
    identitySeed: "Avant toi, un ancetre traversait des terres impossibles sans reculer.",
    titleSeries: ["Qui ne recule jamais", "Des Plaines Eternelles", "Qui connait le Chemin"],
  },
  "NALA LA GRUE ROYALE": {
    animal: "Grue couronnee",
    colors: ["blanc", "or", "rouge vif"],
    identitySeed: "Avant toi, une ancetre dansait pour rappeler qu'il reste de la beaute.",
    titleSeries: ["Qui danse dans l'Aube", "Des Marais Royaux", "Qui apporte la Paix"],
  },
  "BAKARI LE CROCODILE ANCIEN": {
    animal: "Crocodile",
    colors: ["vert kaki", "or ancien", "noir"],
    identitySeed: "Avant toi, un ancetre avait vu passer des empires et n'avait pas bouge.",
    titleSeries: ["Des Eaux Premieres", "Qui n'oublie rien", "Des Rivieres Sacrees"],
  },
  "FATOU LE FAUCON LIBRE": {
    animal: "Faucon",
    colors: ["bleu ciel", "blanc", "or"],
    identitySeed: "Avant toi, une ancetre refusait qu'on lui dise ou elle devait aller.",
    titleSeries: ["Qui n'appartient a personne", "Des Vents Libres", "Ne sans frontieres"],
  },
  "DAYO LE LION DU FEU": {
    animal: "Lion",
    colors: ["orange feu", "rouge", "noir"],
    identitySeed: "Avant toi, un ancetre entrait dans les batailles en chantant.",
    titleSeries: ["Du Feu Originel", "Des Plaines Brulantes", "Qui dompte les Eclairs"],
  },
  "IMANI LA TORTUE ETERNELLE": {
    animal: "Tortue geante",
    colors: ["vert ancien", "or", "terre"],
    identitySeed: "Avant toi, une ancetre savait que la lenteur est une forme de puissance.",
    titleSeries: ["Qui sait attendre", "Des Matins Calmes", "Ne sous les Etoiles"],
  },
};

const prenomsA = [
  "Kwame",
  "Kofi",
  "Ama",
  "Abena",
  "Seun",
  "Kemi",
  "Amara",
  "Amani",
  "Jabari",
  "Dayo",
  "Zola",
  "Mora",
];
const prenomsB = [
  "Aicha",
  "Fatou",
  "Lamine",
  "Mariama",
  "Nala",
  "Soro",
  "Zara",
  "Imani",
  "Yara",
  "Oba",
  "Tara",
  "Elan",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json();
    const seed =
      typeof body?.seed === "string" && body.seed.trim() ? body.seed.trim() : crypto.randomUUID();
    const firstName =
      typeof body?.firstName === "string" && body.firstName.trim()
        ? body.firstName.trim().slice(0, 40)
        : "Toi";
    const answers = isRecord(body?.answers) ? body.answers : {};
    const clanCount = Number.isFinite(Number(body?.clanCount)) ? Number(body.clanCount) : 0;
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
    const detail = totemDetails[totem] ?? {
      animal: totem,
      colors: ["or", "noir", "ivoire"],
      identitySeed: `Avant toi, un ancetre portait ${qualityPhrase(quality)} sans bruit.`,
      titleSeries: ["Du Premier Souffle"],
    };
    const orderNumber =
      Number.isFinite(Number(body?.orderNumber)) && Number(body.orderNumber) > 0
        ? Number(body.orderNumber)
        : (hash(`${seed}:order`) % 999999) + 1;
    const nomComplet = `${pick(prenomsA, seed, "a")}-${pick(prenomsB, seed, "b")}, ${pick(
      detail.titleSeries,
      seed,
      "title",
    )}`;
    const attribut = pickAttribute(quality, answers);
    const clanName = clan(detail.animal);
    const phrase = normalizePhrase(detail.identitySeed, quality);
    const messageClan = `#${orderNumber} rejoint le ${clanName} avec ${attribut}. ${clanCount} membres l'attendaient deja.`;
    const caption = `${nomComplet}\nJe revele mon totem : ${totem}\nA ton tour. #RevealYourTotem`;
    const messageDefi = `J'ai decouvert mon totem ancestral : ${totem}. Toi, tu es quoi ? totemancestral.com`;

    return json({
      type: "junior",
      seed,
      firstName,
      orderNumber,
      scores,
      dominant,
      secondary,
      totem: { name: totem, animal: detail.animal, colors: detail.colors, quality },
      nomComplet,
      phrase,
      attribut,
      messageClan,
      share: { caption, messageDefi },
      caption,
      messageDefi,
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

function normalizePhrase(seedPhrase: string, quality: string) {
  const words = seedPhrase.split(/\s+/);
  if (words.length >= 20 && words.length <= 35) return seedPhrase;
  return `Avant toi, un ancetre portait ${qualityPhrase(
    quality,
  )} dans son geste, son regard et sa maniere d'avancer sans renoncer.`;
}

function pickAttribute(quality: string, answers: Record<string, Record<string, unknown>>) {
  const q3 = answers["3"]?.choice;
  if (q3 === "A") return "Intuition";
  if (q3 === "B") return "Protection";
  if (q3 === "C") return "Elevation";
  if (q3 === "D") return "Puissance";
  return quality;
}

function clan(animal: string) {
  if (animal === "Aigle" || animal === "Elephant") return `Clan de l'${animal}`;
  if (["Lionne", "Panthere", "Grue couronnee", "Tortue geante"].includes(animal)) {
    return `Clan de la ${animal}`;
  }
  return `Clan du ${animal}`;
}

function pick<T>(items: T[], seed: string, salt: string): T {
  return items[hash(`${seed}:${salt}`) % items.length] ?? items[0]!;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result >>> 0);
}
