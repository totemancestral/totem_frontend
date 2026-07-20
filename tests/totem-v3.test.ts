import { describe, it, expect } from "vitest";
import {
  scoreAdultAnswers,
  scoreJuniorAnswers,
  extractParchmentText,
  extractParchmentSections,
  extractAudioScript,
  ADULT_ARCHETYPES,
  JUNIOR_TOTEMS,
} from "../src/lib/totem-v3";

const DIMS = ["F", "E", "T", "A"];

describe("catalogue FETA", () => {
  it("expose 12 archétypes adultes et 12 totems junior", () => {
    expect(Object.keys(ADULT_ARCHETYPES)).toHaveLength(12);
    expect(Object.keys(JUNIOR_TOTEMS)).toHaveLength(12);
  });

  it("chaque archétype adulte porte un id cohérent avec sa clé", () => {
    for (const [key, arch] of Object.entries(ADULT_ARCHETYPES)) {
      expect(arch.id).toBe(key);
    }
  });
});

describe("scoreAdultAnswers", () => {
  it("retombe sur le baobab quand tous les scores sont égaux (aucune réponse)", () => {
    const r = scoreAdultAnswers({});
    expect(r.scores).toEqual({ F: 0, E: 0, T: 0, A: 0 });
    expect(r.dominant).toBe("T");
    expect(r.secondary).toBe("E");
    expect(r.archetype).toBe(ADULT_ARCHETYPES.baobab);
  });

  it("produit un dominant/secondary valides et un archétype défini", () => {
    const answers = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [String(i + 1), { choice: "A" }]),
    );
    const r = scoreAdultAnswers(answers);
    expect(DIMS).toContain(r.dominant);
    expect(DIMS).toContain(r.secondary);
    expect(r.archetype).toBeDefined();
    expect(typeof r.archetype.id).toBe("string");
  });

  it("est déterministe pour une même entrée", () => {
    const answers = { "1": { choice: "B" }, "2": { choice: "C" }, "3": { choice: "D" } };
    expect(scoreAdultAnswers(answers)).toEqual(scoreAdultAnswers(answers));
  });

  it("ignore les réponses marquées skipped", () => {
    const r = scoreAdultAnswers({ "1": { choice: "A", skipped: true } });
    expect(r.scores).toEqual({ F: 0, E: 0, T: 0, A: 0 });
  });
});

describe("scoreJuniorAnswers", () => {
  it("retourne un profil avec un totem junior existant", () => {
    const answers = Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [String(i + 1), { choice: "A" }]),
    );
    const r = scoreJuniorAnswers(answers);
    expect(DIMS).toContain(r.dominant);
    expect(Object.keys(JUNIOR_TOTEMS)).toContain(r.totemId);
  });
});

describe("extraction du contenu généré", () => {
  it("extractParchmentText lit parchment_text depuis un JSON", () => {
    expect(extractParchmentText('{"parchment_text":"  Bonjour  "}')).toBe("Bonjour");
  });

  it("extractParchmentText retombe sur le texte brut sans JSON", () => {
    expect(extractParchmentText("  Texte libre  ")).toBe("Texte libre");
  });

  it("extractParchmentSections mappe un tableau de sections {title,text}", () => {
    const raw = JSON.stringify({ sections: [{ title: "T1", text: "corps" }] });
    const sections = extractParchmentSections(raw);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("T1");
    expect(sections[0].paragraphs).toEqual(["corps"]);
  });

  it("extractAudioScript lit audio_script depuis un JSON", () => {
    expect(extractAudioScript('{"audio_script":"écoute la voix"}')).toBe("écoute la voix");
  });
});
