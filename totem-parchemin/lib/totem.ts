import totemPanthere from "@/assets/totem-panthere.png";

/**
 * Shape of the parchment data. In production this comes from the generation
 * API response (nom utilisateur, nom du totem, image du totem, texte du récit).
 */
export interface StorySection {
  title: string;
  paragraphs: string[];
}

export interface TotemData {
  userName: string;
  totemName: string; // ex: "PANTHÈRE, LE SOUVERAIN SILENCIEUX"
  totemImage: string; // URL / data URI de l'image du totem
  subtitle: string;
  sections: StorySection[]; // le récit personnalisé
}

/**
 * Réponse simulée du "griot". Remplacer le corps par un vrai appel API :
 *   const res = await fetch("/api/generer-parchemin", { ... })
 *   return res.json()
 * La structure de TotemData doit rester identique.
 */
export async function generateTotem(answers?: Record<string, unknown>): Promise<TotemData> {
  void answers;
  return {
    userName: "Amara Diallo",
    totemName: "PANTHÈRE, LE SOUVERAIN SILENCIEUX",
    totemImage: totemPanthere,
    subtitle: "Décret royal de révélation symbolique",
    sections: [
      {
        title: "L'Éveil",
        paragraphs: [
          "Aux premières lueurs du monde, alors que la savane retenait son souffle, les esprits gardiens se penchèrent sur ton berceau. Ils reconnurent en toi une flamme rare : celle qui n'éclaire pas pour être vue, mais pour guider ceux qui marchent dans l'ombre.",
          "Ton totem s'avança sans un bruit. La Panthère, souveraine des silences, choisit les âmes qui savent que la vraie force ne rugit jamais.",
        ],
      },
      {
        title: "Le Sang & la Terre",
        paragraphs: [
          "De tes ancêtres tu tiens la patience du fleuve et la mémoire de la pierre. Là où d'autres se hâtent, tu observes ; là où d'autres crient, tu écoutes. C'est ainsi que se reconnaissent les gardiens des lignées anciennes.",
        ],
      },
      {
        title: "La Voie",
        paragraphs: [
          "Ton chemin est celui de l'équilibre entre l'instinct et la sagesse. La Panthère te confie sa vision nocturne : voir clair quand tout le monde doute, avancer sûr quand le sentier se dérobe.",
          "Que ce parchemin te rappelle, aux heures de doute, qui tu es vraiment : un souverain silencieux, porté par le souffle des ancêtres.",
        ],
      },
    ],
  };
}
