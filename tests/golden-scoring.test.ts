import { describe, it, expect } from "vitest";
import { scoreAdultAnswers, scoreJuniorAnswers } from "../src/lib/totem-v3";

/**
 * Tests « golden » : verrouillent l'attribution scoring -> archétype/totem pour
 * des vecteurs de réponses fixes. Toute modification involontaire des matrices
 * de scoring (`ADULT_SCORING`, `JUNIOR_SCORING`) ou des tables d'attribution
 * fera échouer ces tests — c'est le garde-fou anti-dérive front/back.
 *
 * Si une évolution est INTENTIONNELLE, régénérer les valeurs attendues et
 * répliquer le changement côté backend (totem_backend).
 */

const vec = (choices: string[]) =>
  Object.fromEntries(choices.map((choice, index) => [String(index + 1), { choice }]));

describe("golden — scoreAdultAnswers", () => {
  it("vecteur tout-A -> Lionne (F dominant, T secondaire)", () => {
    const r = scoreAdultAnswers(vec(["A", "A", "A", "A", "A", "A", "A", "A", "A", "A"]));
    expect(r.scores).toEqual({ F: 32.5, E: 3, T: 12, A: 2.5 });
    expect(r.dominant).toBe("F");
    expect(r.secondary).toBe("T");
    expect(r.archetype.id).toBe("lionne");
  });

  it("vecteur A/B/C/D -> Crocodile (E dominant, T secondaire)", () => {
    const r = scoreAdultAnswers(vec(["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]));
    expect(r.scores).toEqual({ F: 8, E: 20.5, T: 12.5, A: 9 });
    expect(r.dominant).toBe("E");
    expect(r.secondary).toBe("T");
    expect(r.archetype.id).toBe("crocodile");
  });

  it("vecteur orienté T -> Elephant (T dominant, F secondaire)", () => {
    const r = scoreAdultAnswers(vec(["D", "D", "C", "C", "B", "B", "A", "A", "D", "C"]));
    expect(r.scores).toEqual({ F: 12, E: 5.5, T: 24.5, A: 5 });
    expect(r.dominant).toBe("T");
    expect(r.secondary).toBe("F");
    expect(r.archetype.id).toBe("elephant");
  });
});

describe("golden — scoreJuniorAnswers", () => {
  it("vecteur A/B/C/D/A -> kwame_aigle (A dominant, F secondaire)", () => {
    const r = scoreJuniorAnswers(vec(["A", "B", "C", "D", "A"]));
    expect(r.scores).toEqual({ F: 8, E: 1, T: 2, A: 10 });
    expect(r.dominant).toBe("A");
    expect(r.secondary).toBe("F");
    expect(r.totemId).toBe("kwame_aigle");
  });

  it("vecteur D/C/B/A/D -> kemi_serpent (E dominant, A secondaire)", () => {
    const r = scoreJuniorAnswers(vec(["D", "C", "B", "A", "D"]));
    expect(r.scores).toEqual({ F: 3, E: 8, T: 4, A: 5 });
    expect(r.dominant).toBe("E");
    expect(r.secondary).toBe("A");
    expect(r.totemId).toBe("kemi_serpent");
  });
});
