import { describe, expect, it } from "vitest";
import {
  adultIndicators,
  formatAdultAnswer,
  toAdultBackendAnswers,
} from "../src/lib/adult-answers";

describe("adult frontend answer contract", () => {
  it("always emits q1..q10 for completion, including skipped q6", () => {
    const value = { 1: { choice: "A" }, 6: { skipped: true } };
    const result = toAdultBackendAnswers(value, true);
    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({ questionId: "q1", answer: "A" });
    expect(result[5]).toEqual({ questionId: "q6", answer: "skipped" });
  });

  it("keeps indicators about free-text fields only", () => {
    const value = { 1: { choice: "A" }, 2: { choice: "B", field: "  nuance  " } };
    expect(adultIndicators(value)).toMatchObject({ q1_filled: false, q2_filled: true });
  });

  it("formats skipped answers without scoring context", () => {
    expect(formatAdultAnswer({ skipped: true })).toBe("skipped");
    expect(formatAdultAnswer({ choice: "D", field: " libre " })).toBe("D | libre");
  });
});
