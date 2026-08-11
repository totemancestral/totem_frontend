export type Locale = "fr" | "en";
export type ChoiceLetter = "A" | "B" | "C" | "D";
export type FetaDimension = "F" | "E" | "T" | "A";
export type FetaScores = Record<FetaDimension, number>;

export type TotemAnswer = {
  choice?: ChoiceLetter;
  field?: string;
  skipped?: boolean;
};

export type AdultArchetypeId =
  | "lion"
  | "lionne"
  | "rhinoceros"
  | "crocodile"
  | "serpent"
  | "dauphin"
  | "elephant"
  | "baobab"
  | "zebre"
  | "perroquet"
  | "aigle"
  | "leopard";

export type AdultArchetype = {
  id: AdultArchetypeId;
  french: string;
  english: string;
  people: string;
  region: string;
  element: FetaDimension;
  quality: string;
  clanFr: string;
  clanEn: string;
};

export type AdultTotemProfile = {
  firstName: string;
  language: Locale;
  seed: string;
  orderNumber: number;
  season: string;
  hour: string;
  scores: FetaScores;
  dominant: FetaDimension;
  secondary: FetaDimension;
  archetype: AdultArchetype;
  prenomA: string;
  prenomB: string;
  title: string;
  nomComplet: string;
  workTitleFr: string;
  workTitleEn: string;
};

export type AdultPromptBundle = {
  promptA1: string;
  promptA2: string;
  promptA3: string;
  promptA4: string;
  promptA5: string;
  narrativeVariant: "A" | "B" | "C" | "D";
  visualFrame: 1 | 2 | 3 | 4 | 5;
  imagePrompt: string;
  audioScriptFallback: string;
  shareFallback: {
    captionLinkedin: string;
    messageWhatsapp: string;
    messageClan: string;
  };
};

const ZERO_SCORES: FetaScores = { F: 0, E: 0, T: 0, A: 0 };
const DIMENSIONS: FetaDimension[] = ["F", "E", "T", "A"];

const ADULT_SCORING: Record<number, Record<ChoiceLetter, FetaScores>> = {
  1: {
    A: { F: 3, E: 0, T: 0, A: 0 },
    B: { F: 0, E: 3, T: 0, A: 0 },
    C: { F: 0, E: 0, T: 3, A: 0 },
    D: { F: 0, E: 0, T: 0, A: 3 },
  },
  2: {
    A: { F: 3, E: 0, T: 1, A: 0 },
    B: { F: 1, E: 1, T: 0, A: 2 },
    C: { F: 0, E: 2, T: 2, A: 0 },
    D: { F: 0, E: 2, T: 0, A: 2 },
  },
  3: {
    A: { F: 6, E: 0, T: 2, A: 0 },
    B: { F: 0, E: 4, T: 0, A: 4 },
    C: { F: 0, E: 2, T: 6, A: 0 },
    D: { F: 2, E: 0, T: 0, A: 6 },
  },
  4: {
    A: { F: 3, E: 0, T: 1, A: 0 },
    B: { F: 0, E: 2, T: 0, A: 2 },
    C: { F: 1, E: 0, T: 3, A: 0 },
    D: { F: 0, E: 3, T: 0, A: 1 },
  },
  5: {
    A: { F: 2, E: 0, T: 1, A: 1 },
    B: { F: 3, E: 0, T: 0, A: 0 },
    C: { F: 0, E: 1, T: 2, A: 1 },
    D: { F: 0, E: 3, T: 0, A: 1 },
  },
  6: {
    A: { F: 1.5, E: 0, T: 0, A: 1.5 },
    B: { F: 0, E: 1.5, T: 1.5, A: 0 },
    C: { F: 1.5, E: 0, T: 1.5, A: 0 },
    D: { F: 0.5, E: 0.5, T: 0.5, A: 0.5 },
  },
  7: {
    A: { F: 6, E: 0, T: 2, A: 0 },
    B: { F: 2, E: 0, T: 0, A: 6 },
    C: { F: 2, E: 2, T: 4, A: 0 },
    D: { F: 0, E: 6, T: 0, A: 2 },
  },
  8: {
    A: { F: 2, E: 0, T: 3, A: 0 },
    B: { F: 2, E: 0, T: 2, A: 1 },
    C: { F: 0, E: 2, T: 2, A: 1 },
    D: { F: 0, E: 2, T: 0, A: 3 },
  },
  9: {
    A: { F: 0, E: 3, T: 0, A: 0 },
    B: { F: 0, E: 0, T: 0, A: 3 },
    C: { F: 3, E: 0, T: 0, A: 0 },
    D: { F: 0, E: 0, T: 3, A: 0 },
  },
  10: {
    A: { F: 6, E: 0, T: 2, A: 0 },
    B: { F: 0, E: 6, T: 0, A: 2 },
    C: { F: 0, E: 0, T: 6, A: 0 },
    D: { F: 2, E: 0, T: 0, A: 6 },
  },
};

export const ADULT_ARCHETYPES: Record<AdultArchetypeId, AdultArchetype> = {
  lion: {
    id: "lion",
    french: "Lion",
    english: "Lion",
    people: "Yoruba",
    region: "Nigeria",
    element: "F",
    quality: "Leadership",
    clanFr: "Clan du Lion",
    clanEn: "Clan of the Lion",
  },
  lionne: {
    id: "lionne",
    french: "Lionne",
    english: "Lioness",
    people: "Maasai",
    region: "Kenya / Tanzanie",
    element: "F",
    quality: "Protection",
    clanFr: "Clan de la Lionne",
    clanEn: "Clan of the Lioness",
  },
  rhinoceros: {
    id: "rhinoceros",
    french: "Rhinocéros",
    english: "Rhinoceros",
    people: "Zulu",
    region: "Afrique du Sud",
    element: "F",
    quality: "Détermination",
    clanFr: "Clan du Rhinocéros",
    clanEn: "Clan of the Rhinoceros",
  },
  crocodile: {
    id: "crocodile",
    french: "Crocodile",
    english: "Crocodile",
    people: "Mande",
    region: "Mali / Guinée",
    element: "E",
    quality: "Gardien",
    clanFr: "Clan du Crocodile",
    clanEn: "Clan of the Crocodile",
  },
  serpent: {
    id: "serpent",
    french: "Serpent",
    english: "Serpent",
    people: "Fon",
    region: "Bénin",
    element: "E",
    quality: "Transformation",
    clanFr: "Clan du Serpent",
    clanEn: "Clan of the Serpent",
  },
  dauphin: {
    id: "dauphin",
    french: "Dauphin",
    english: "Dolphin",
    people: "Serer",
    region: "Sénégal",
    element: "E",
    quality: "Joie",
    clanFr: "Clan du Dauphin",
    clanEn: "Clan of the Dolphin",
  },
  elephant: {
    id: "elephant",
    french: "Éléphant",
    english: "Elephant",
    people: "Akan",
    region: "Ghana",
    element: "T",
    quality: "Mémoire",
    clanFr: "Clan de l'Éléphant",
    clanEn: "Clan of the Elephant",
  },
  baobab: {
    id: "baobab",
    french: "Baobab",
    english: "Baobab",
    people: "Wolof",
    region: "Sénégal",
    element: "T",
    quality: "Ancestralité",
    clanFr: "Clan du Baobab",
    clanEn: "Clan of the Baobab",
  },
  zebre: {
    id: "zebre",
    french: "Zèbre",
    english: "Zebra",
    people: "Ndebele",
    region: "Afrique du Sud",
    element: "T",
    quality: "Équilibre",
    clanFr: "Clan du Zèbre",
    clanEn: "Clan of the Zebra",
  },
  perroquet: {
    id: "perroquet",
    french: "Perroquet",
    english: "Parrot",
    people: "Ashanti",
    region: "Ghana",
    element: "A",
    quality: "Parole",
    clanFr: "Clan du Perroquet",
    clanEn: "Clan of the Parrot",
  },
  aigle: {
    id: "aigle",
    french: "Aigle",
    english: "Eagle",
    people: "Dogon",
    region: "Mali",
    element: "A",
    quality: "Vision",
    clanFr: "Clan de l'Aigle",
    clanEn: "Clan of the Eagle",
  },
  leopard: {
    id: "leopard",
    french: "Léopard",
    english: "Leopard",
    people: "Yoruba",
    region: "Nigeria",
    element: "F",
    quality: "Grâce",
    clanFr: "Clan du Léopard",
    clanEn: "Clan of the Leopard",
  },
};

const ADULT_ATTRIBUTION: Record<FetaDimension, Record<FetaDimension, AdultArchetypeId>> = {
  F: { A: "lion", T: "lionne", E: "rhinoceros", F: "lion" },
  E: { T: "crocodile", A: "serpent", F: "dauphin", E: "serpent" },
  T: { F: "elephant", E: "baobab", A: "zebre", T: "elephant" },
  A: { E: "perroquet", F: "aigle", T: "zebre", A: "aigle" },
};

const PRENOMS_A = [
  "Kwame",
  "Kofi",
  "Ama",
  "Abena",
  "Yaw",
  "Akua",
  "Kojo",
  "Adwoa",
  "Seun",
  "Temi",
  "Yemi",
  "Bisi",
  "Femi",
  "Kemi",
  "Sola",
  "Tobi",
  "Emeka",
  "Chidi",
  "Ngozi",
  "Amara",
  "Amani",
  "Baraka",
  "Dalila",
  "Farida",
  "Jabari",
  "Kamau",
  "Lulu",
  "Makena",
  "Nia",
  "Rafiki",
  "Lomba",
  "Maka",
  "Nkosi",
  "Sangi",
  "Zola",
  "Bayo",
  "Dayo",
  "Kani",
  "Lewa",
  "Mora",
];

const PRENOMS_B = [
  "Aicha",
  "Fatou",
  "Ibrahim",
  "Kadija",
  "Lamine",
  "Mariama",
  "Oumar",
  "Rokhaya",
  "Samba",
  "Tidiane",
  "Ayasha",
  "Bongi",
  "Chanda",
  "Dineo",
  "Enoch",
  "Fumani",
  "Gugu",
  "Hawa",
  "Imani",
  "Jomo",
  "Kais",
  "Lola",
  "Manu",
  "Nala",
  "Oba",
  "Pita",
  "Rami",
  "Soro",
  "Tara",
  "Ugo",
  "Vusi",
  "Wata",
  "Xola",
  "Yara",
  "Zara",
  "Akou",
  "Baki",
  "Cela",
  "Dara",
  "Elan",
];

const TITLE_SERIES: Record<string, string[]> = {
  air: [
    "Qui vit dans l'Éclair",
    "Des Vents du Nord",
    "Qui traverse les Orages",
    "Des Sommets Silencieux",
    "Qui voit la Nuit",
    "Des Horizons Perdus",
    "Né dans la Tempête",
    "Qui porte le Soleil",
    "Des Falaises Anciennes",
    "Qui chante au Vent",
  ],
  fire: [
    "Du Feu Originel",
    "Qui rugit sans bruit",
    "Des Plaines Brûlantes",
    "Né dans les Braises",
    "Qui garde la Flamme",
    "Des Terres Rouges",
    "Qui marche dans les Cendres",
    "Du Premier Matin",
    "Qui dompte les Éclairs",
    "Des Royaumes Oubliés",
  ],
  shadow: [
    "Des Ombres Profondes",
    "Qui frappe dans le Silence",
    "Des Nuits Sans Lune",
    "Né entre Deux Mondes",
    "Qui disparaît au Lever",
    "Des Forêts Interdites",
    "Qui connaît les Secrets",
    "Des Passages Cachés",
    "Né dans le Mystère",
    "Qui attend l'Heure Juste",
  ],
  earth: [
    "Qui porte la Mémoire",
    "Des Terres Immémoriales",
    "Qui ne recule jamais",
    "Des Racines Profondes",
    "Qui connaît le Chemin",
    "Des Ancêtres Debout",
    "Qui traverse les Siècles",
    "Des Plaines Éternelles",
    "Qui garde les Vivants",
    "Des Temps Premiers",
  ],
  water: [
    "Qui lit les Eaux",
    "Des Profondeurs Anciennes",
    "Qui connaît la Vérité",
    "Des Rivières Sacrées",
    "Né sous la Terre",
    "Qui parle aux Ombres",
    "Des Sources Cachées",
    "Qui transforme tout",
    "Des Eaux Premières",
    "Qui n'oublie rien",
  ],
  grace: [
    "Qui danse dans l'Aube",
    "Des Marais Royaux",
    "Né dans la Brume",
    "Qui apporte la Paix",
    "Des Lagons Silencieux",
    "Qui marche sans bruit",
    "Des Matins Calmes",
    "Qui sait attendre",
    "Des Rives Bénies",
    "Né sous les Étoiles",
  ],
  universal: [
    "Du Premier Souffle",
    "Né avant les Noms",
    "Qui connaît l'Origine",
    "Des Temps Oubliés",
    "Qui porta la Lumière",
    "Des Nuits Fondatrices",
    "Né quand tout commençait",
    "Qui traversa les Âges",
    "Des Mémoires Vivantes",
    "Né pour se souvenir",
  ],
};

const TITLE_SERIES_BY_ARCHETYPE: Record<AdultArchetypeId, keyof typeof TITLE_SERIES> = {
  lion: "fire",
  lionne: "fire",
  rhinoceros: "earth",
  crocodile: "water",
  serpent: "water",
  dauphin: "water",
  elephant: "earth",
  baobab: "universal",
  zebre: "grace",
  perroquet: "air",
  aigle: "air",
  leopard: "shadow",
};

const QUESTION_LABELS_FR = [
  "L'element naturel",
  "Le moment vivant",
  "Le regard des autres",
  "La reaction a l'epreuve",
  "L'heure de l'ame",
  "L'origine ancestrale",
  "La colere sacree",
  "La trace dans le monde",
  "Le symbole interieur",
  "Le regard de l'ancetre",
];

const CHOICE_LABELS_FR: Record<number, Record<ChoiceLetter, string>> = {
  1: {
    A: "Le feu - sa chaleur, sa puissance, sa danse",
    B: "L'eau - sa profondeur, ses courants, ses mysteres",
    C: "La terre - son ancrage, sa memoire, ses racines",
    D: "Le vent - sa liberte, sa hauteur, son souffle",
  },
  2: {
    A: "Dans l'action - quand je decide, j'agis, j'avance",
    B: "Dans la creation - quand je fais naitre quelque chose",
    C: "Dans le lien - quand je suis profondement connecte aux autres",
    D: "Dans la solitude paisible - quand je pense, j'observe, je comprends",
  },
  3: {
    A: "La force - une presence qui rassure ou impressionne",
    B: "La sagesse - un regard qui voit plus loin",
    C: "La douceur - une chaleur qui accueille et protege",
    D: "La liberte - quelqu'un qui ne se laisse pas enfermer",
  },
  4: {
    A: "J'agis immediatement - l'action dissipe l'incertitude",
    B: "J'observe - je comprends avant d'agir",
    C: "Je cherche des allies - ensemble on est plus forts",
    D: "Je rentre en moi - l'epreuve se traverse d'abord interieurement",
  },
  5: {
    A: "L'aube - ce moment suspendu avant que le monde commence",
    B: "Le plein jour - la lumiere franche, l'energie au sommet",
    C: "Le crepuscule - la beaute de ce qui finit et ce qui commence",
    D: "La nuit profonde - le silence, les etoiles, la verite",
  },
  6: {
    A: "Afrique de l'Ouest - Nigeria, Ghana, Senegal, Mali",
    B: "Afrique centrale / australe - Congo, Cameroun, Angola, Afrique du Sud",
    C: "Afrique de l'Est - Kenya, Tanzanie, Ethiopie, Somalie",
    D: "Origine indeterminee - l'Afrique entiere m'appelle",
  },
  7: {
    A: "L'injustice - quand les forts ecrasent les faibles",
    B: "La mediocrite acceptee - quand on renonce a ce qu'on pourrait etre",
    C: "La trahison - quand on brise la confiance de quelqu'un",
    D: "La destruction de la beaute - quand on abime ce qui est precieux",
  },
  8: {
    A: "Proteger - avoir garde en vie ce qui meritait de vivre",
    B: "Batir - avoir construit quelque chose qui durera apres moi",
    C: "Connecter - avoir rassemble ce qui etait separe",
    D: "Reveler - avoir montre ce que personne ne voyait",
  },
  9: {
    A: "L'eau - rivieres, mers, pluie, profondeur",
    B: "La hauteur - montagnes, sommets, horizon lointain",
    C: "Le feu - flammes, lumiere, chaleur, aube",
    D: "Les racines - arbres, terre, foret, fondations",
  },
  10: {
    A: "Un guerrier en attente - la puissance retenue qui cherche sa bataille",
    B: "Un sage trop discret - une profondeur que peu de gens ont eu la chance de voir",
    C: "Un coeur genereux - quelqu'un qui donne plus qu'il ne recoit",
    D: "Un esprit libre - quelqu'un qui refuse les cases et trace sa propre route",
  },
};

export function scoreAdultAnswers(answers: Record<string, unknown>): {
  scores: FetaScores;
  dominant: FetaDimension;
  secondary: FetaDimension;
  archetype: AdultArchetype;
} {
  const scores: FetaScores = { ...ZERO_SCORES };

  for (let question = 1; question <= 10; question += 1) {
    const choice = getChoice(answers[String(question)]);
    if (!choice) continue;

    const score = ADULT_SCORING[question]?.[choice];
    if (!score) continue;

    for (const dimension of DIMENSIONS) {
      scores[dimension] += score[dimension];
    }
  }

  const allEqual = DIMENSIONS.every((dimension) => scores[dimension] === scores.F);
  if (allEqual) {
    return {
      scores,
      dominant: "T",
      secondary: "E",
      archetype: ADULT_ARCHETYPES.baobab,
    };
  }

  const sorted = sortDimensions(scores);
  let dominant = sorted[0].dimension;

  if (sorted[0].score === sorted[1].score) {
    const tied = sorted
      .filter((item) => item.score === sorted[0].score)
      .map((item) => item.dimension);
    dominant =
      dominantFromQuestion(answers, 7, tied) ??
      dominantFromQuestion(answers, 3, tied) ??
      sorted[0].dimension;
  } else if (sorted[0].score - sorted[1].score < 3) {
    dominant = dominantFromQuestion(answers, 5) ?? sorted[0].dimension;
  }

  const secondary =
    sortDimensions(scores).find((item) => item.dimension !== dominant)?.dimension ?? dominant;
  const archetypeId =
    ADULT_ATTRIBUTION[dominant][secondary] ?? ADULT_ATTRIBUTION[dominant][dominant];

  return {
    scores,
    dominant,
    secondary,
    archetype: ADULT_ARCHETYPES[archetypeId],
  };
}

export function createAdultTotemProfile(input: {
  firstName: string;
  language: Locale;
  answers: Record<string, unknown>;
  seed: string;
  orderNumber: number;
  now?: Date;
}): AdultTotemProfile {
  const now = input.now ?? new Date();
  const scored = scoreAdultAnswers(input.answers);
  const series = TITLE_SERIES[TITLE_SERIES_BY_ARCHETYPE[scored.archetype.id]];
  const prenomA = pickSeeded(PRENOMS_A, input.seed, "prenom-a");
  const prenomB = pickSeeded(PRENOMS_B, input.seed, "prenom-b");
  const title = pickSeeded(series, input.seed, "title");
  const nomComplet = `${prenomA}-${prenomB}, ${title}`;

  return {
    firstName: input.firstName,
    language: input.language,
    seed: input.seed,
    orderNumber: input.orderNumber,
    season: getSeason(now, input.language),
    hour: getHourPeriod(now, input.language),
    scores: scored.scores,
    dominant: scored.dominant,
    secondary: scored.secondary,
    archetype: scored.archetype,
    prenomA,
    prenomB,
    title,
    nomComplet,
    workTitleFr: workTitle(scored.archetype, "fr"),
    workTitleEn: workTitle(scored.archetype, "en"),
  };
}

export function buildAdultPromptBundle(input: {
  profile: AdultTotemProfile;
  answers: Record<string, unknown>;
  clanCount: number;
  parchmentText?: string;
  passage?: string;
}): AdultPromptBundle {
  const narrativeVariant = pickSeeded(["A", "B", "C", "D"] as const, input.profile.seed, "variant");
  const visualFrame = pickSeeded([1, 2, 3, 4, 5] as const, input.profile.seed, "visual-frame");
  const promptA1 = buildPromptA1(input.profile, input.answers);
  const promptA2 = buildPromptA2(input.profile, input.answers, narrativeVariant);
  const promptA3 = buildPromptA3(input.profile, input.parchmentText ?? "");
  const promptA4 = buildPromptA4(input.profile, input.answers, visualFrame);
  const promptA5 = buildPromptA5(
    input.profile,
    input.clanCount,
    input.passage ?? extractPassage(input.parchmentText ?? ""),
  );

  return {
    promptA1,
    promptA2,
    promptA3,
    promptA4,
    promptA5,
    narrativeVariant,
    visualFrame,
    imagePrompt: buildImagePrompt(input.profile, input.answers, visualFrame),
    audioScriptFallback: buildAudioScriptFallback(input.profile, input.parchmentText ?? ""),
    shareFallback: buildShareFallback(
      input.profile,
      input.clanCount,
      input.passage ?? extractPassage(input.parchmentText ?? ""),
    ),
  };
}

export type StorySection = {
  title: string;
  paragraphs: string[];
};

export function extractParchmentText(raw: string): string {
  const parsed = extractJson(raw) as { parchment_text?: unknown } | null;
  if (typeof parsed?.parchment_text === "string" && parsed.parchment_text.trim()) {
    return parsed.parchment_text.trim();
  }

  return raw.trim();
}

function buildSectionsFromText(text: string): StorySection[] {
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);
  if (paragraphs.length <= 2) {
    return [{ title: "", paragraphs }];
  }
  const mid = Math.ceil(paragraphs.length / 2);
  return [
    { title: "", paragraphs: paragraphs.slice(0, mid) },
    { title: "", paragraphs: paragraphs.slice(mid) },
  ];
}

export function extractParchmentSections(raw: string): StorySection[] {
  const parsed = extractJson(raw) as Record<string, unknown> | null;

  if (parsed) {
    // Nouveau format: sections array avec title + text
    if (Array.isArray(parsed.sections)) {
      const items = parsed.sections as { title?: string; text?: string; paragraphs?: string[] }[];
      if (items.length > 0) {
        return items
          .filter((s) => {
            const txt = s.text ?? s.paragraphs?.join("\n") ?? "";
            return txt.trim().length > 0;
          })
          .map((s) => ({
            title: s.title ?? "",
            paragraphs: s.text ? [s.text.trim()] : (s.paragraphs ?? []),
          }));
      }
    }

    // Legacy format: individual movement keys
    const movementKeys = ["opening", "portrait", "trial", "transmission", "passage"] as const;
    const movementTitles: Record<string, string> = {
      opening: "L'Ouverture",
      portrait: "Le Portrait",
      trial: "L'Épreuve",
      transmission: "La Transmission",
      passage: "Le Passage",
    };

    const hasMovements = movementKeys.some(
      (k) => typeof parsed[k] === "string" && (parsed[k] as string).trim().length > 0,
    );

    if (hasMovements) {
      return movementKeys
        .filter((k) => typeof parsed[k] === "string" && (parsed[k] as string).trim().length > 0)
        .map((k) => ({
          title: movementTitles[k],
          paragraphs: [(parsed[k] as string).trim()],
        }));
    }

    if (typeof parsed.parchment_text === "string" && parsed.parchment_text.trim()) {
      return buildSectionsFromText(parsed.parchment_text.trim());
    }
  }

  // Réponse brute, parser manuellement pour fallback
  const text = raw.trim();
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);

  if (paragraphs.length <= 2) {
    return [{ title: "", paragraphs: [text] }];
  }

  const half = Math.ceil(paragraphs.length / 2);
  return [
    { title: "", paragraphs: paragraphs.slice(0, half) },
    { title: "", paragraphs: paragraphs.slice(half) },
  ];
}

export function extractAudioScript(raw: string): string {
  const parsed = extractJson(raw) as { audio_script?: unknown } | null;
  if (typeof parsed?.audio_script === "string" && parsed.audio_script.trim()) {
    return parsed.audio_script.trim();
  }

  return raw.trim();
}

export function buildAdultFallbackParchment(
  profile: AdultTotemProfile,
  answers: Record<string, unknown>,
) {
  const lines = Array.from({ length: 10 }, (_, index) => getAnswer(answers, index + 1).field)
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());

  if (profile.language === "en") {
    return [
      `At the hour of ${profile.hour}, a figure of the ${profile.archetype.english} would have stood near the old threshold of ${profile.archetype.region}.`,
      `${profile.nomComplet} carries a quiet sign: ${profile.archetype.quality.toLowerCase()}, held without display and offered only when the path demands it.`,
      lines[0]
        ? `Your own words return as a trace: ${lines[0]}`
        : "The fable keeps its silence where no word was given.",
      `${profile.firstName}, receive this not as proof, but as an artwork: a name, a passage, a lamp placed before the next step.`,
    ].join("\n\n");
  }

  return [
    `A l'heure du ${profile.hour}, une figure du ${profile.archetype.french} aurait veille pres d'un seuil ancien de ${profile.archetype.region}.`,
    `${profile.nomComplet} porte un signe discret : ${profile.archetype.quality.toLowerCase()}, tenu sans fracas et offert lorsque le chemin l'exige.`,
    lines[0]
      ? `Tes propres mots reviennent comme une trace : ${lines[0]}`
      : "La fable garde son silence la ou aucun mot n'a ete donne.",
    `${profile.firstName}, recois ceci non comme une preuve, mais comme une oeuvre : un nom, un passage, une lampe posee devant le prochain pas.`,
  ].join("\n\n");
}

export type JuniorTotemId =
  | "kwame_aigle"
  | "amara_lionne"
  | "zara_leopard"
  | "kemi_serpent"
  | "seun_elephant"
  | "aida_panthere"
  | "kofi_buffle"
  | "nala_grue"
  | "bakari_crocodile"
  | "fatou_faucon"
  | "dayo_lion"
  | "imani_tortue";

export type JuniorProfile = {
  scores: FetaScores;
  dominant: FetaDimension;
  secondary: FetaDimension;
  totemId: JuniorTotemId;
};

export type JuniorTotem = {
  id: JuniorTotemId;
  name: string;
  animal: string;
  colors: string[];
  quality: string;
  identitySeed: string;
};

export type JuniorTotemProfile = JuniorProfile & {
  firstName: string;
  seed: string;
  orderNumber: number;
  clanCount: number;
  totem: JuniorTotem;
  prenomA: string;
  prenomB: string;
  title: string;
  nomComplet: string;
  /** Sexe declare : genre le totem et son recit. `null` = neutre. */
  gender: JuniorGender;
};

/** `null` quand le sexe n'a pas ete declare : le recit reste neutre. */
export type JuniorGender = "homme" | "femme" | null;

export type JuniorPromptBundle = {
  promptJ1: string;
  promptJ2: string;
  promptJ3: string;
  promptJ4: string;
  fallback: {
    phrase: string;
    attribut: string;
    messageClan: string;
    caption: string;
    messageDefi: string;
  };
};

const JUNIOR_SCORING: Record<number, Record<ChoiceLetter, FetaScores>> = {
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

const JUNIOR_ATTRIBUTION: Record<FetaDimension, Record<FetaDimension, JuniorTotemId>> = {
  F: { A: "dayo_lion", E: "zara_leopard", T: "kofi_buffle", F: "amara_lionne" },
  E: { A: "kemi_serpent", T: "bakari_crocodile", F: "aida_panthere", E: "imani_tortue" },
  T: { F: "seun_elephant", A: "nala_grue", E: "imani_tortue", T: "seun_elephant" },
  A: { F: "kwame_aigle", E: "fatou_faucon", T: "kwame_aigle", A: "fatou_faucon" },
};

export const JUNIOR_TOTEMS: Record<JuniorTotemId, JuniorTotem> = {
  kwame_aigle: {
    id: "kwame_aigle",
    name: "KWAME L'AIGLE DES CIMES",
    animal: "Aigle",
    colors: ["or", "bleu nuit", "blanc"],
    quality: "Vision",
    identitySeed: "Avant toi, un ancetre regardait l'horizon et voyait demain.",
  },
  amara_lionne: {
    id: "amara_lionne",
    name: "AMARA LA LIONNE DES SAVANES",
    animal: "Lionne",
    colors: ["ocre", "rouge terre", "or"],
    quality: "Protection",
    identitySeed: "Avant toi, une ancetre tenait debout ce que le vent voulait renverser.",
  },
  zara_leopard: {
    id: "zara_leopard",
    name: "ZARA LE LEOPARD DES OMBRES",
    animal: "Léopard",
    colors: ["noir", "or", "vert foret"],
    quality: "Precision",
    identitySeed: "Avant toi, un ancetre attendait dans le silence pour agir dans la lumiere.",
  },
  kemi_serpent: {
    id: "kemi_serpent",
    name: "KEMI LE SERPENT SAGE",
    animal: "Serpent royal",
    colors: ["vert profond", "noir", "argent"],
    quality: "Sagesse",
    identitySeed: "Avant toi, une ancetre lisait les secrets que la terre murmure.",
  },
  seun_elephant: {
    id: "seun_elephant",
    name: "SEUN L'ELEPHANT GARDIEN",
    animal: "Éléphant",
    colors: ["gris ardoise", "terre rouge", "or"],
    quality: "Mémoire",
    identitySeed: "Avant toi, un ancetre portait la memoire de tous ceux qui etaient partis.",
  },
  aida_panthere: {
    id: "aida_panthere",
    name: "AIDA LA PANTHERE NOIRE",
    animal: "Panthere",
    colors: ["noir", "violet", "or"],
    quality: "Mystere",
    identitySeed: "Avant toi, une ancetre marchait entre deux mondes sans jamais choisir.",
  },
  kofi_buffle: {
    id: "kofi_buffle",
    name: "KOFI LE BUFFLE DES PLAINES",
    animal: "Buffle",
    colors: ["marron profond", "rouge", "noir"],
    quality: "Endurance",
    identitySeed: "Avant toi, un ancetre traversait des terres impossibles sans reculer.",
  },
  nala_grue: {
    id: "nala_grue",
    name: "NALA LA GRUE ROYALE",
    animal: "Grue couronnee",
    colors: ["blanc", "or", "rouge vif"],
    quality: "Elegance",
    identitySeed: "Avant toi, une ancetre dansait pour rappeler qu'il reste de la beaute.",
  },
  bakari_crocodile: {
    id: "bakari_crocodile",
    name: "BAKARI LE CROCODILE ANCIEN",
    animal: "Crocodile",
    colors: ["vert kaki", "or ancien", "noir"],
    quality: "Longevite",
    identitySeed: "Avant toi, un ancetre avait vu passer des empires et n'avait pas bouge.",
  },
  fatou_faucon: {
    id: "fatou_faucon",
    name: "FATOU LE FAUCON LIBRE",
    animal: "Faucon",
    colors: ["bleu ciel", "blanc", "or"],
    quality: "Liberte",
    identitySeed: "Avant toi, une ancetre refusait qu'on lui dise ou elle devait aller.",
  },
  dayo_lion: {
    id: "dayo_lion",
    name: "DAYO LE LION DU FEU",
    animal: "Lion",
    colors: ["orange feu", "rouge", "noir"],
    quality: "Intensite",
    identitySeed: "Avant toi, un ancetre entrait dans les batailles en chantant.",
  },
  imani_tortue: {
    id: "imani_tortue",
    name: "IMANI LA TORTUE ETERNELLE",
    animal: "Tortue geante",
    colors: ["vert ancien", "or", "terre"],
    quality: "Patience",
    identitySeed: "Avant toi, une ancetre savait que la lenteur est une forme de puissance.",
  },
};

export function scoreJuniorAnswers(answers: Record<string, unknown>): JuniorProfile {
  const scores: FetaScores = { ...ZERO_SCORES };

  for (let question = 1; question <= 5; question += 1) {
    const choice = getChoice(answers[String(question)]);
    if (!choice) continue;
    const score = JUNIOR_SCORING[question]?.[choice];
    if (!score) continue;
    for (const dimension of DIMENSIONS) {
      scores[dimension] += score[dimension];
    }
  }

  const sorted = sortDimensions(scores);
  const dominant = sorted[0].dimension;
  const secondary = sorted.find((item) => item.dimension !== dominant)?.dimension ?? dominant;

  return {
    scores,
    dominant,
    secondary,
    totemId: JUNIOR_ATTRIBUTION[dominant][secondary] ?? JUNIOR_ATTRIBUTION[dominant][dominant],
  };
}

export function createJuniorTotemProfile(input: {
  firstName?: string;
  answers: Record<string, unknown>;
  seed: string;
  orderNumber?: number;
  clanCount?: number;
  gender?: JuniorGender;
}): JuniorTotemProfile {
  const scored = scoreJuniorAnswers(input.answers);
  const totem = JUNIOR_TOTEMS[scored.totemId];
  const title = pickSeeded(
    TITLE_SERIES[juniorTitleSeries(scored.totemId)],
    input.seed,
    "junior-title",
  );
  const prenomA = pickSeeded(PRENOMS_A, input.seed, "junior-prenom-a");
  const prenomB = pickSeeded(PRENOMS_B, input.seed, "junior-prenom-b");

  return {
    ...scored,
    firstName: input.firstName?.trim() || "Toi",
    seed: input.seed,
    orderNumber: input.orderNumber ?? (numericSeed(input.seed) % 999999) + 1,
    clanCount: input.clanCount ?? 0,
    totem,
    prenomA,
    prenomB,
    title,
    nomComplet: `${prenomA}-${prenomB}, ${title}`,
    gender: input.gender ?? null,
  };
}

export function buildJuniorPromptBundle(input: {
  profile: JuniorTotemProfile;
  answers: Record<string, unknown>;
}): JuniorPromptBundle {
  const fallback = buildJuniorFallback(input.profile, input.answers);

  return {
    promptJ1: buildPromptJ1(input.profile),
    promptJ2: buildPromptJ2(input.profile, input.answers),
    promptJ3: buildPromptJ3(input.profile, input.answers),
    promptJ4: buildPromptJ4(input.profile, fallback.phrase, fallback.attribut),
    fallback,
  };
}

export function extractStrictJson(raw: string): Record<string, unknown> | null {
  return extractJson(raw) as Record<string, unknown> | null;
}

type TotemArtworkVisual = {
  animalEn: string;
  leftFaceFr: string;
  leftFaceEn: string;
};

const TOTEM_ARTWORK_VISUALS: Record<AdultArchetypeId, TotemArtworkVisual> = {
  lion: {
    animalEn: "lion",
    leftFaceFr: "visage de lion réaliste avec crinière noire et regard perçant",
    leftFaceEn: "realistic lion face with a black mane and piercing gaze",
  },
  lionne: {
    animalEn: "lioness",
    leftFaceFr: "visage de lionne réaliste avec regard protecteur et pelage ocre",
    leftFaceEn: "realistic lioness face with a protective gaze and ochre fur",
  },
  rhinoceros: {
    animalEn: "rhinoceros",
    leftFaceFr: "visage de rhinocéros réaliste avec corne massive et peau gravée",
    leftFaceEn: "realistic rhinoceros face with a massive horn and engraved skin",
  },
  crocodile: {
    animalEn: "crocodile",
    leftFaceFr: "visage de crocodile réaliste avec écailles sombres et regard ancien",
    leftFaceEn: "realistic crocodile face with dark scales and an ancient gaze",
  },
  serpent: {
    animalEn: "serpent",
    leftFaceFr: "visage de serpent royal réaliste avec écailles profondes et regard hypnotique",
    leftFaceEn: "realistic royal serpent face with deep scales and a hypnotic gaze",
  },
  dauphin: {
    animalEn: "dolphin",
    leftFaceFr: "visage de dauphin réaliste avec reflets bleus et regard lumineux",
    leftFaceEn: "realistic dolphin face with blue reflections and a luminous gaze",
  },
  elephant: {
    animalEn: "elephant",
    leftFaceFr: "visage d'éléphant réaliste avec défenses sculpturales et regard ancestral",
    leftFaceEn: "realistic elephant face with sculptural tusks and ancestral gaze",
  },
  baobab: {
    animalEn: "baobab",
    leftFaceFr: "visage anthropomorphe de baobab réaliste avec écorce massive et racines sculptées",
    leftFaceEn: "realistic anthropomorphic baobab face with massive bark and carved roots",
  },
  zebre: {
    animalEn: "zebra",
    leftFaceFr: "visage de zèbre réaliste avec rayures nettes et regard calme",
    leftFaceEn: "realistic zebra face with sharp stripes and a calm gaze",
  },
  perroquet: {
    animalEn: "parrot",
    leftFaceFr: "visage de perroquet réaliste avec plumage vert et or et regard vif",
    leftFaceEn: "realistic parrot face with green and gold plumage and a vivid gaze",
  },
  aigle: {
    animalEn: "eagle",
    leftFaceFr: "visage d'aigle réaliste avec bec royal et regard perçant",
    leftFaceEn: "realistic eagle face with a royal beak and piercing gaze",
  },
  leopard: {
    animalEn: "leopard",
    leftFaceFr: "visage de léopard réaliste avec taches sombres et regard précis",
    leftFaceEn: "realistic leopard face with dark rosettes and a precise gaze",
  },
};

export function buildTotemArtworkImagePrompt(input: {
  archetypeId: AdultArchetypeId;
  language?: Locale;
  seed: string;
  visualFrame?: 1 | 2 | 3 | 4 | 5;
  personalityKeywords?: string[];
}): string {
  const visual = TOTEM_ARTWORK_VISUALS[input.archetypeId];
  const seed = numericSeed(input.seed);
  const keywords = input.personalityKeywords?.filter(Boolean).slice(0, 5).join(", ");
  const frame = input.visualFrame ? visualFrameDescription(input.visualFrame) : "";
  const animalDescriptor =
    input.language === "en"
      ? visual.animalEn
      : visual.leftFaceFr.replace(/^visage de |^visage d'|^visage anthropomorphe de /, "");
  const splitFace =
    input.language === "en"
      ? "split-face fusion on the totem head: left half realistic animal face, right half stylized Fang Ngil mask with white eyes and geometric motifs, seamless central merge"
      : "fusion du visage du totem : moitie gauche visage animal realiste, moitie droite masque Ngil Fang stylise aux yeux blancs et motifs geometriques, fusion harmonieuse sur l'axe central";

  return [
    input.language === "en"
      ? `premium ancestral totem sculpture, full-body statue of ${animalDescriptor}, single centered subject on ritual black-and-gold pedestal`
      : `sculpture totemique ancestrale premium, statue complete de ${animalDescriptor}, sujet unique centre sur socle rituel noir et or`,
    input.language === "en"
      ? "engraved African geometric ornaments, ebony and ancient gold materials"
      : "ornements geometriques africains ciselés, matiere ebene et dorure ancienne",
    splitFace,
    input.language === "en"
      ? "dark mystical atmosphere, dramatic cinematic lighting, museum-grade render, ultra detailed, high resolution 8k"
      : "ambiance sombre mystique, eclairage cinematographique dramatique, rendu musee, ultra detaille, haute resolution 8k",
    input.language === "en"
      ? "no human, no human bust, no human torso, no person, no text, no logo, no watermark"
      : "aucun humain, aucun buste humain, aucun torse humain, aucun personnage, sans texte, sans logo, sans watermark",
    keywords ? `personality keywords: ${keywords}` : "",
    frame ? `composition: ${frame}` : "",
    `--ar 3:4 --stylize 250 --v 6 --seed ${seed}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export const buildNgilMaskImagePrompt = buildTotemArtworkImagePrompt;

const JUNIOR_ATTRIBUTES = [
  "Vitesse",
  "Mémoire",
  "Vision",
  "Protection",
  "Sagesse",
  "Liberte",
  "Intensite",
  "Patience",
  "Precision",
  "Grâce",
  "Endurance",
  "Mystere",
  "Intuition",
  "Courage",
  "Elevation",
  "Messager",
  "Profondeur",
  "Équilibre",
  "Transformation",
  "Loyaute",
  "Creativite",
  "Silence",
  "Puissance",
  "Lumiere",
  "Ombre",
  "Resistance",
  "Fluidite",
  "Ancrage",
  "Tranchant",
  "Presence",
];

const JUNIOR_RESPONSE_LABELS: Record<number, Record<ChoiceLetter, string>> = {
  1: {
    A: "Une flamme qui s'impose",
    B: "Une vague qui s'adapte",
    C: "Une ombre qui observe",
    D: "Un eclair qui surprend",
  },
  2: {
    A: "La foret profonde",
    B: "Le sommet d'une montagne",
    C: "L'ocean sans fond",
    D: "La savane a l'aube",
  },
  3: {
    A: "Lire les gens au premier regard",
    B: "Proteger ceux que tu aimes",
    C: "Trouver un chemin la ou il n'y en a pas",
    D: "Faire bouger les autres",
  },
  4: {
    A: "Tu gardes tout a l'interieur",
    B: "Tu te bats seul avant de demander",
    C: "Tu joues un role selon les gens",
    D: "Tu ressens tout trop fort",
  },
  5: {
    A: "L'envie de voler au-dessus de tout",
    B: "L'instinct de chasser ce que tu veux",
    C: "Le besoin de tenir quelque chose debout",
    D: "Le desir de comprendre ce que personne ne voit",
  },
};

function buildPromptJ1(profile: JuniorTotemProfile) {
  return `Tu es le Griot de TOTEM ANCESTRAL.

Tu composes les noms ancestraux des adolescents qui decouvrent leur totem.

TOTEM ARCHETYPE : ${profile.totem.name}
COMPOSANTE A : ${profile.prenomA}
COMPOSANTE B : ${profile.prenomB}
TITRE POETIQUE PRE-TIRE : ${profile.title}
PROFIL ENERGETIQUE : Feu=${profile.scores.F} / Eau=${profile.scores.E} / Terre=${profile.scores.T} / Air=${profile.scores.A}
SEED : ${profile.seed}

MISSION :
1. Assembler le nom : [prenom_a]-[prenom_b], [titre]
2. Verifier que le titre est coherent avec le profil energetique dominant
3. Si coherence < 60%, proposer une variante dans la meme serie poetique
4. Retourner uniquement le nom final valide

REPONSE — Format JSON STRICT :
{
"nom_complet": "${profile.nomComplet}",
"titre_valide": true,
"titre_variante": ""
}`;
}

/** Consigne de genre inseree dans les prompts Junior. */
function juniorGenderLine(gender: JuniorGender): string {
  if (gender === "homme") {
    return "MASCULIN — accorde tout le texte au masculin, sans formulation neutre.";
  }
  if (gender === "femme") {
    return "FEMININ — accorde tout le texte au feminin, sans formulation neutre.";
  }
  return "NON DECLARE — garde des formulations valables au masculin comme au feminin.";
}

function buildPromptJ2(profile: JuniorTotemProfile, answers: Record<string, unknown>) {
  return `Tu es le Griot de TOTEM ANCESTRAL.

Tu parles a des adolescents entre 10 et 15 ans.
Ton registre : oral, poetique, puissant. Jamais scientifique. Jamais religieux.

TOTEM : ${profile.totem.name}
NOM ANCESTRAL : ${profile.nomComplet}
SEXE : ${juniorGenderLine(profile.gender)}

REPONSES DU PROFIL :
Q1 (energie) : ${juniorAnswerLabel(answers, 1)}
Q2 (territoire) : ${juniorAnswerLabel(answers, 2)}
Q3 (don) : ${juniorAnswerLabel(answers, 3)}
Q4 (ombre) : ${juniorAnswerLabel(answers, 4)}
Q5 (appel) : ${juniorAnswerLabel(answers, 5)}
SEED : ${profile.seed}

MISSION :
Genere UNE phrase d'identite ancestrale.
Elle commence OBLIGATOIREMENT par "Avant toi,"
Elle raconte en une seule phrase ce qu'un ancetre portait comme don, lieu ou acte.

CONTRAINTES STRICTES :
· Entre 20 et 35 mots
· Jamais de nom de divinite, de rituel ou de formule sacree
· Jamais de reference a une ethnie precise
· Une seule phrase. Pas de point de suspension. Pas d'explication.

REPONSE — Format JSON STRICT :
{
"phrase": "Avant toi, [la phrase complete]."
}`;
}

function buildPromptJ3(profile: JuniorTotemProfile, answers: Record<string, unknown>) {
  return `Tu es le Griot de TOTEM ANCESTRAL.

Tu accueilles un adolescent dans son Clan.

TOTEM : ${profile.totem.name}
NOM ANCESTRAL : ${profile.nomComplet}
SEXE : ${juniorGenderLine(profile.gender)}
CLAN : ${juniorClanName(profile.totem)}
NUMERO MONDIAL : ${profile.orderNumber}
DON DECLARE (Q3) : ${juniorAnswerLabel(answers, 3)}
OMBRE DECLAREE (Q4) : ${juniorAnswerLabel(answers, 4)}
SCORES : Feu=${profile.scores.F} / Eau=${profile.scores.E} / Terre=${profile.scores.T} / Air=${profile.scores.A}
MEMBRES DU CLAN : ${profile.clanCount}

SORTIE 1 — ATTRIBUT SECONDAIRE
Choisis UN attribut parmi cette liste, en coherence avec les scores et Q3/Q4 :
${JUNIOR_ATTRIBUTES.join(" / ")}

SORTIE 2 — MESSAGE D'ACCUEIL CLAN
Une phrase de 15-25 mots. Chaleureuse, fiere, communautaire.
Mentionne le numero mondial et le nom du Clan.

REPONSE — Format JSON STRICT :
{
"attribut": "[un seul attribut de la liste]",
"message_clan": "[message d'accueil]"
}`;
}

function buildPromptJ4(profile: JuniorTotemProfile, phrase: string, attribut: string) {
  return `Tu es le Griot de TOTEM ANCESTRAL.

Tu generes des textes de partage pour adolescents sur les reseaux sociaux.
Ton : fier, mysterieux, direct. Jamais trop long. Jamais niais.

NOM ANCESTRAL : ${profile.nomComplet}
TOTEM : ${profile.totem.name}
ATTRIBUT : ${attribut}
NUMERO MONDIAL : #${profile.orderNumber}
PHRASE D'IDENTITE : ${phrase}

MISSION — Deux sorties distinctes :

VERSION A — TikTok / Instagram
Maximum 3 lignes. Accroche forte en ligne 1 avec le nom ancestral.
Ligne 3 : appel a l'action. Inclut #RevealYourTotem

VERSION B — Snapchat / WhatsApp
1-2 phrases maximum. Defi direct a un ami. Inclut totem-ancestral.com

REPONSE — Format JSON STRICT :
{
"caption": "Texte TikTok/Instagram pret a poster",
"message_defi": "Message Snapchat/WhatsApp pret a envoyer"
}`;
}

function buildJuniorFallback(profile: JuniorTotemProfile, answers: Record<string, unknown>) {
  const attribute = pickJuniorAttribute(profile, answers);
  const clanName = juniorClanName(profile.totem);
  const phrase = normalizeJuniorPhrase(profile.totem.identitySeed, profile);
  const messageClan = `#${profile.orderNumber} rejoint le ${clanName} avec ${attribute}. ${profile.clanCount} membres l'attendaient deja.`;

  return {
    phrase,
    attribut: attribute,
    messageClan,
    caption: `${profile.nomComplet}\nJe revele mon totem : ${profile.totem.name}\nA ton tour. #RevealYourTotem`,
    messageDefi: `J'ai decouvert mon totem ancestral : ${profile.totem.name}. Toi, tu es quoi ? totem-ancestral.com`,
  };
}

function pickJuniorAttribute(profile: JuniorTotemProfile, answers: Record<string, unknown>) {
  const byTotem: Partial<Record<JuniorTotemId, string>> = {
    kwame_aigle: "Vision",
    amara_lionne: "Protection",
    zara_leopard: "Precision",
    kemi_serpent: "Sagesse",
    seun_elephant: "Mémoire",
    aida_panthere: "Mystere",
    kofi_buffle: "Endurance",
    nala_grue: "Grâce",
    bakari_crocodile: "Resistance",
    fatou_faucon: "Liberte",
    dayo_lion: "Intensite",
    imani_tortue: "Patience",
  };

  const q3 = getChoice(answers["3"]);
  if (q3 === "A") return "Intuition";
  if (q3 === "B") return "Protection";
  if (q3 === "C") return "Elevation";
  if (q3 === "D") return "Puissance";

  return (
    byTotem[profile.totemId] ?? pickSeeded(JUNIOR_ATTRIBUTES, profile.seed, "junior-attribute")
  );
}

function normalizeJuniorPhrase(seedPhrase: string, profile: JuniorTotemProfile) {
  const words = seedPhrase.split(/\s+/);
  if (words.length >= 20 && words.length <= 35) return seedPhrase;

  return `Avant toi, un ancetre portait ${juniorQualityPhrase(profile.totem.quality)} dans son geste, et ce signe avance maintenant avec ton nom.`;
}

function juniorClanName(totem: JuniorTotem) {
  if (["Aigle", "Éléphant"].includes(totem.animal)) return `Clan de l'${totem.animal}`;
  if (["Lionne", "Panthere", "Grue couronnee", "Tortue geante"].includes(totem.animal)) {
    return `Clan de la ${totem.animal}`;
  }
  return `Clan du ${totem.animal}`;
}

function juniorQualityPhrase(quality: string) {
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

function juniorTitleSeries(totemId: JuniorTotemId): keyof typeof TITLE_SERIES {
  if (totemId === "kwame_aigle" || totemId === "fatou_faucon") return "air";
  if (totemId === "dayo_lion" || totemId === "amara_lionne") return "fire";
  if (totemId === "zara_leopard" || totemId === "aida_panthere") return "shadow";
  if (totemId === "kemi_serpent" || totemId === "bakari_crocodile") return "water";
  if (totemId === "nala_grue" || totemId === "imani_tortue") return "grace";
  return "earth";
}

function juniorAnswerLabel(answers: Record<string, unknown>, question: number) {
  const choice = getChoice(answers[String(question)]);
  return choice ? JUNIOR_RESPONSE_LABELS[question][choice] : "Non renseigne";
}

function buildPromptA1(profile: AdultTotemProfile, answers: Record<string, unknown>) {
  return `Tu es la conscience artistique de TOTEM ANCESTRAL, une maison de creation parisienne.

Tu recois les reponses d'une personne a 10 questions intimes posees par un griot virtuel.
Ta mission : attribuer l'archetype ancestral juste et composer le nom ancestral unique.

CONTEXTE — TOTEM ANCESTRAL est une experience artistique et symbolique.
Ce n'est pas de la genealogie, ni de la science, ni de la divination. C'est une fable.
Tu composes une oeuvre, pas une verite.

DONNEES D'ENTREE :
Prenom : ${profile.firstName}
Numero mondial : ${profile.orderNumber}
Saison : ${profile.season} · Heure : ${profile.hour}
Seed : ${profile.seed}
Scores FETA : F=${profile.scores.F} / E=${profile.scores.E} / T=${profile.scores.T} / A=${profile.scores.A}

REPONSES AU PARCOURS GRIOT :
${formatPromptAnswers(answers)}

NOM ANCESTRAL PRE-TIRE :
Composante A : ${profile.prenomA}
Composante B : ${profile.prenomB}
Titre poetique : ${profile.title}

REPONSE — Format JSON STRICT, sans texte avant ou apres :
{
"archetype": "${profile.archetype.id}",
"archetype_french": "${profile.archetype.french}",
"archetype_english": "${profile.archetype.english}",
"people": "${profile.archetype.people}",
"region": "${profile.archetype.region}",
"nom_complet": "${profile.nomComplet}",
"titre_valide": true,
"work_title_fr": "${profile.workTitleFr}",
"work_title_en": "${profile.workTitleEn}",
"reasoning_brief": "Attribution determinee par la matrice FETA adulte puis affinee par les reponses libres."
}`;
}

function buildPromptA2(
  profile: AdultTotemProfile,
  answers: Record<string, unknown>,
  narrativeVariant: "A" | "B" | "C" | "D",
) {
  const variantStructures: Record<string, string> = {
    A: `MOUVEMENT 1 — L'OUVERTURE (200-250 car.) : decor, lieu, heure de vie de l'ancetre
MOUVEMENT 2 — LE PORTRAIT (350-400 car.) : apparence, geste, relation au peuple
MOUVEMENT 3 — L'EPREUVE (350-400 car.) : scene emblematique, inspiree de la culture
MOUVEMENT 4 — LA TRANSMISSION (300-350 car.) : ce que l'ancetre a transmis
MOUVEMENT 5 — LE PASSAGE (250-300 car.) : adresse directe a ${profile.firstName}`,
    B: `MOUVEMENT 1 — L'ADRESSE (200-250 car.) : l'ancetre s'adresse d'abord a ${profile.firstName} depuis le present, prise de parole directe
MOUVEMENT 2 — LA REMONTEE (350-400 car.) : le recit remonte vers l'origine ancestrale, vers le temps du peuple
MOUVEMENT 3 — L'EPREUVE (350-400 car.) : scene emblematique vecue par l'ancetre dans les temps anciens
MOUVEMENT 4 — LE PORTRAIT (300-350 car.) : retour sur qui etait cet ancetre, son apparence, son geste
MOUVEMENT 5 — LE RETOUR (250-300 car.) : retour au present, lien avec ${profile.firstName}, transmission finale`,
    C: `MOUVEMENT 1 — LA SCENE (200-250 car.) : commencer in medias res, une scene intense et vive, un instant suspendu
MOUVEMENT 2 — LE RECUL (350-400 car.) : recul temporel, plan large, le contexte de la scene se revele progressivement
MOUVEMENT 3 — L'ORIGINE (350-400 car.) : retour a l'origine, portrait de l'ancetre, son peuple, sa terre
MOUVEMENT 4 — L'EPREUVE (300-350 car.) : scene emblematique qui a forge l'ancetre et son enseignement
MOUVEMENT 5 — LE RETOUR AU PRESENT (250-300 car.) : retour au present, adresse directe a ${profile.firstName}, benediction`,
    D: `MOUVEMENT 1 — L'APPEL (200-250 car.) : le lieu et l'instant propice, l'ancetre appelle ${profile.firstName}, debut de l'echange
MOUVEMENT 2 — LA PAROLE DU SAGE (350-400 car.) : l'ancetre parle en italiques, il raconte qui il est et ce qu'il a vecu
MOUVEMENT 3 — L'ECHO DU DESCENDANT (350-400 car.) : ${profile.firstName} repond en son for interieur, l'ancetre percoit la reponse
MOUVEMENT 4 — L'ENSEIGNEMENT (300-350 car.) : l'ancetre transmet sa verite en italiques, parole directe et incarnee
MOUVEMENT 5 — LA BENEDICTION (250-300 car.) : mot de la fin, benediction et adresse finale de l'ancetre a ${profile.firstName}`,
  };

  return `Tu es la plume artistique de TOTEM ANCESTRAL.

Tu vas composer le Parchemin Ancestral de ${profile.firstName}.

CONTEXTE :
Archétype : ${profile.archetype.french} · Peuple inspirant : ${profile.archetype.people} (${profile.archetype.region})
Nom ancestral : ${profile.nomComplet}
Titre de l'oeuvre : "${profile.workTitleFr}"
Numero mondial : ${profile.orderNumber} · Saison : ${profile.season} · Heure : ${profile.hour}
Seed : ${profile.seed}
Langue : ${profile.language}
Variante narrative selectionnee : ${narrativeVariant} (${narrativeVariant === "A" ? "Classique" : narrativeVariant === "B" ? "Inversee" : narrativeVariant === "C" ? "Flashback" : "Dialogue"})

REPONSES AUX 10 QUESTIONS :
${formatPromptAnswers(answers)}

STRUCTURE OBLIGATOIRE — 5 mouvements (variante ${narrativeVariant}) :
${variantStructures[narrativeVariant]}

Le nom ${profile.nomComplet} doit apparaitre au moins une fois dans le recit.

REGLES STRICTES :
- PONCTUATION : n'utilise JAMAIS de tiret (-) ni de tiret cadratin (—) pour separer des mots, des idees ou des phrases, ni devant un numero. Emploie une ponctuation francaise correcte : virgule, point, deux-points, parentheses. Le tiret n'est admis qu'a l'interieur d'un mot compose.
· Total : 1500-1800 caracteres espaces compris
· Conditionnel doux : "il aurait vecu", JAMAIS "tu es" pour l'ancetre
· Jamais de verite scientifique ou ethnique — c'est une fable
· Inspirer des cosmogonies du peuple sans reciter un mythe authentique connu
· Vocabulaire premium : pas de superlatifs, pas d'emojis, pas d'anglicismes
· Eviter les cliches : pas de "pieds dans la terre rouge", pas de "yeux remplis de mystere"
· Si Langue = en : composer en anglais, meme ton, cadence biblique simplifiee

REPONSE — Format JSON STRICT :
{
"parchment_text": "Texte complet, 5 mouvements separes par \\n\\n",
"opening": "Mouvement 1 isole",
"portrait": "Mouvement 2 isole",
"trial": "Mouvement 3 isole",
"transmission": "Mouvement 4 isole",
"passage": "Mouvement 5 isole",
"character_count": 1650,
"narrative_variant_used": "${narrativeVariant}"
}`;
}

function buildPromptA3(profile: AdultTotemProfile, parchmentText: string) {
  return `Tu vas composer le message audio que la voix de l'ancetre adressera a ${profile.firstName}.

CONTEXTE :
Archétype : ${profile.archetype.french} · Peuple : ${profile.archetype.people}
Nom ancestral : ${profile.nomComplet}
Texte du parchemin : "${parchmentText.slice(0, 1400)}"
Langue : ${profile.language}

STRUCTURE :
· Adresse initiale ("${profile.firstName}, ecoute...") — 1-2 phrases
· Evocation de la lignee imaginee — 2-3 phrases
· Une verite ou conseil de l'ancetre — 2-3 phrases
· Adresse finale ("sois...", "marche...", "porte...") — 1-2 phrases

REGLES STRICTES :
- PONCTUATION : n'utilise JAMAIS de tiret (-) ni de tiret cadratin (—) pour separer des mots, des idees ou des phrases, ni devant un numero. Emploie une ponctuation francaise correcte : virgule, point, deux-points, parentheses. Le tiret n'est admis qu'a l'interieur d'un mot compose.
· Longueur : 130-160 mots
· Phrases courtes — faciliter la diction
· Pas de chiffres en chiffres
· Pauses : "..." ou retour a la ligne
· Ton : pose, grave, doux, sans pathos ni grandiloquence
· Si Langue = en : composer en anglais, style King James simplifie

REPONSE — Format JSON STRICT :
{
"audio_script": "Le script complet, pret synthese vocale",
"word_count": 145,
"estimated_duration_seconds": 88
}`;
}

function buildPromptA4(
  profile: AdultTotemProfile,
  answers: Record<string, unknown>,
  visualFrame: 1 | 2 | 3 | 4 | 5,
) {
  const keywords = personalityKeywords(answers);
  const visualPrompt = buildTotemArtworkImagePrompt({
    archetypeId: profile.archetype.id,
    language: profile.language,
    seed: profile.seed,
    visualFrame,
    personalityKeywords: keywords,
  });

  return `Tu vas composer un prompt Midjourney v6 pour l'oeuvre visuelle de ${profile.firstName}.

CONTEXTE :
Archétype : ${profile.archetype.english} · Peuple : ${profile.archetype.people} (${profile.archetype.region})
Nom ancestral : ${profile.nomComplet}
Cadre visuel selectionne : ${visualFrame}
Seed : ${profile.seed}
Indices de personnalite : ${keywords.join(", ")}

STYLE ARTISTIQUE TOTEM :
Esthetique : musee, mystique, ancestrale, intemporelle
Palette : noir profond #0D0D1A, or ancestral #C9A84C, terres ocre, indigo, ivoire
References : Vladimir Cybil Charlier + Kerry James Marshall + Aboudia + masques rituels patines
Pas de realisme photographique. Pas de cartoonesque. Pas d'AI flat.

FORMAT VISUEL OBLIGATOIRE :
Sculpture totemique ancestrale de type objet d'art : animal entier sur socle rituel noir et or, materiaux ebene et dorure ancienne, details geometriques africains. Le visage de la tete du totem est fusionne : moitie gauche animal realiste, moitie droite masque Ngil Fang stylise, fusion harmonieuse sur l'axe central. Aucun corps humain, aucun torse humain, aucun buste humain.

BASE DE PROMPT A CONSERVER :
${visualPrompt}

REGLES :
- PONCTUATION : jamais de tiret (-) ni de tiret cadratin (—) entre des mots ou des idees, ni devant un numero. Ponctuation francaise correcte uniquement.
· Fusion du visage obligatoire sur la tete du totem : animal realiste a gauche, masque Ngil Fang a droite
· Sujet principal obligatoire : l'animal-sculpture complet, pas un portrait humain
· Aucun humain, aucun torse, aucun buste, aucun personnage
· Pas de texte dans l'image, pas de logos
· Format vertical 3:4 obligatoire
· Parametres obligatoires : --ar 3:4 --stylize 250 --v 6
· --seed ${numericSeed(profile.seed)} obligatoire

REPONSE — Format JSON STRICT :
{
"midjourney_prompt": "Le prompt complet EN, 80-120 mots",
"personality_keywords": ["kw1", "kw2", "kw3"],
"visual_elements": "Description courte des elements visuels uniques",
"visual_frame_used": ${visualFrame}
}`;
}

function buildPromptA5(profile: AdultTotemProfile, clanCount: number, passage: string) {
  return `Tu es le Griot de TOTEM ANCESTRAL.

Tu generes les textes de partage et le message d'accueil dans le Clan.

DONNEES :
Prenom : ${profile.firstName}
Nom ancestral : ${profile.nomComplet}
Archétype : ${profile.archetype.french}
Clan : ${profile.archetype.clanFr}
Numero mondial : #${profile.orderNumber}
Attribut principal : ${profile.archetype.quality}
Phrase du parchemin : ${passage || "Le passage final reste a composer."}
Membres du Clan actuellement : ${clanCount}

MISSION — Trois sorties distinctes :
SORTIE 1 — CAPTION LINKEDIN / INSTAGRAM : maximum 4 lignes, inclut #RevealYourTotem.
SORTIE 2 — MESSAGE WHATSAPP : 2 phrases maximum, inclut totem-ancestral.com.
SORTIE 3 — MESSAGE D'ACCUEIL CLAN : une phrase de 20-35 mots.

REPONSE — Format JSON STRICT :
{
"caption_linkedin": "Texte caption LinkedIn/Instagram",
"message_whatsapp": "Message de defi WhatsApp",
"message_clan": "Message d'accueil dans le Clan"
}`;
}

function buildImagePrompt(
  profile: AdultTotemProfile,
  answers: Record<string, unknown>,
  visualFrame: 1 | 2 | 3 | 4 | 5,
) {
  return buildTotemArtworkImagePrompt({
    archetypeId: profile.archetype.id,
    language: profile.language,
    seed: profile.seed,
    visualFrame,
    personalityKeywords: personalityKeywords(answers),
  });
}

function buildAudioScriptFallback(profile: AdultTotemProfile, parchmentText: string) {
  const passage = extractPassage(parchmentText);
  if (profile.language === "en") {
    return `${profile.firstName}, listen...\n\nA name has been placed before you: ${profile.nomComplet}. It is not a proof, but a lamp. In this fable, the ${profile.archetype.english} walks near the old memory of ${profile.archetype.people} lands.\n\nCarry ${profile.archetype.quality.toLowerCase()} without noise. Let it guide your hand when the road narrows.\n\n${passage || "Walk with a quiet heart, and leave behind what does not deserve your strength."}`;
  }

  return `${profile.firstName}, ecoute...\n\nUn nom a ete pose devant toi : ${profile.nomComplet}. Ce n'est pas une preuve, c'est une lampe. Dans cette fable, le ${profile.archetype.french} marche pres de l'ancienne memoire ${profile.archetype.people}.\n\nPorte ${profile.archetype.quality.toLowerCase()} sans bruit. Laisse ce signe guider ta main quand la route se resserre.\n\n${passage || "Marche avec le coeur calme, et laisse derriere toi ce qui ne merite pas ta force."}`;
}

function buildShareFallback(profile: AdultTotemProfile, clanCount: number, passage: string) {
  const clan = profile.language === "en" ? profile.archetype.clanEn : profile.archetype.clanFr;

  if (profile.language === "en") {
    return {
      captionLinkedin: `${profile.nomComplet}\nA symbolic fable has named my ancestral totem: ${profile.archetype.english}.\n${passage || "A passage opens; a name remains."}\nReveal yours: totem-ancestral.com #RevealYourTotem`,
      messageWhatsapp: `I discovered my ancestral totem: ${profile.archetype.english}. Your turn: totem-ancestral.com`,
      messageClan: `#${profile.orderNumber} enters the ${clan}; ${clanCount} members already carry this sign before ${profile.nomComplet}.`,
    };
  }

  return {
    captionLinkedin: `${profile.nomComplet}\nUne fable symbolique m'a donne mon totem ancestral : ${profile.archetype.french}.\n${passage || "Un passage s'ouvre ; un nom demeure."}\nRevele le tien : totem-ancestral.com #RevealYourTotem`,
    messageWhatsapp: `J'ai decouvert mon totem ancestral : ${profile.archetype.french}. A ton tour : totem-ancestral.com`,
    messageClan: `#${profile.orderNumber} entre dans le ${clan} ; ${clanCount} membres portaient deja ce signe avant ${profile.nomComplet}.`,
  };
}

function formatPromptAnswers(answers: Record<string, unknown>) {
  return Array.from({ length: 10 }, (_, index) => {
    const question = index + 1;
    const answer = getAnswer(answers, question);
    const choice = answer.skipped
      ? "Question passee"
      : answer.choice
        ? CHOICE_LABELS_FR[question][answer.choice]
        : "Non renseigne";
    const field = answer.field?.trim() || "Aucune reponse libre";
    return `Q${question} (${QUESTION_LABELS_FR[index]}) : "${field}" / Choix : ${choice}`;
  }).join("\n");
}

function extractPassage(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return paragraphs.at(-1) ?? "";
}

function personalityKeywords(answers: Record<string, unknown>) {
  const words = Object.values(answers)
    .flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const field = (value as TotemAnswer).field ?? "";
      return field
        .toLowerCase()
        .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 5);
    })
    .slice(0, 5);

  return words.length >= 3 ? words.slice(0, 5) : ["resilient", "intuitive", "rooted"];
}

function visualFrameDescription(frame: 1 | 2 | 3 | 4 | 5) {
  const frames = {
    1: "frontal majestic subject, direct gaze, centered composition, frontal ceremonial light",
    2: "contemplative three-quarter profile, gaze toward the horizon, warm side light",
    3: "dynamic three-quarter pose, subtle movement, backlit sacred atmosphere",
    4: "slightly high royal angle, subject raising the eyes, solemn sacred mood",
    5: "low-angle portrait, imposing subject, sky or nature behind the figure",
  };
  return frames[frame];
}

function getAnswer(answers: Record<string, unknown>, question: number): TotemAnswer {
  const value = answers[String(question)];
  if (!value || typeof value !== "object") return {};
  return value as TotemAnswer;
}

function getChoice(value: unknown): ChoiceLetter | null {
  if (!value || typeof value !== "object") return null;
  const answer = value as TotemAnswer;
  if (answer.skipped) return null;
  return answer.choice && ["A", "B", "C", "D"].includes(answer.choice) ? answer.choice : null;
}

function dominantFromQuestion(
  answers: Record<string, unknown>,
  question: number,
  allowed?: FetaDimension[],
): FetaDimension | null {
  const choice = getChoice(answers[String(question)]);
  if (!choice) return null;
  const scores = ADULT_SCORING[question]?.[choice];
  if (!scores) return null;
  const sorted = sortDimensions(scores);
  const dimension = sorted[0].dimension;
  if (allowed && !allowed.includes(dimension)) return null;
  return dimension;
}

function sortDimensions(scores: FetaScores) {
  return DIMENSIONS.map((dimension) => ({ dimension, score: scores[dimension] })).sort(
    (left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return DIMENSIONS.indexOf(left.dimension) - DIMENSIONS.indexOf(right.dimension);
    },
  );
}

function pickSeeded<T>(items: readonly T[], seed: string, salt: string): T {
  return items[hash(`${seed}:${salt}`) % items.length];
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result >>> 0);
}

function numericSeed(seed: string) {
  return hash(seed) % 2147483647;
}

function getSeason(date: Date, locale: Locale) {
  const month = date.getMonth() + 1;
  const season =
    month >= 3 && month <= 5
      ? "spring"
      : month >= 6 && month <= 8
        ? "summer"
        : month >= 9 && month <= 11
          ? "autumn"
          : "winter";

  if (locale === "en") return season;
  return {
    spring: "printemps",
    summer: "ete",
    autumn: "automne",
    winter: "hiver",
  }[season];
}

function getHourPeriod(date: Date, locale: Locale) {
  const hour = date.getHours();
  const period =
    hour >= 5 && hour < 12 ? "morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night";

  if (locale === "en") return period;
  return {
    morning: "matin",
    afternoon: "apres-midi",
    evening: "soir",
    night: "nuit",
  }[period];
}

function workTitle(archetype: AdultArchetype, locale: Locale) {
  if (locale === "en") {
    return `The ${archetype.english}'s ${archetype.quality}`;
  }
  return `La ${archetype.quality} du ${archetype.french}`;
}

function extractJson(raw: string): unknown | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}
