import { describe, expect, it } from "vitest";
import { adultResumeStep, hasAdultAnswersThrough, adultDraftSchema } from "../lib/adult-flow";

describe("frontend adult progress", () => {
  const four = { "1": { choice: "A" as const }, "2": { choice: "B" as const }, "3": { choice: "C" as const }, "4": { choice: "D" as const } };
  it("resumes at the payment boundary before payment, then at question 5", () => {
    expect(adultResumeStep(four, false)).toBe(3);
    expect(adultResumeStep(four, true)).toBe(4);
    expect(hasAdultAnswersThrough(four, 4)).toBe(true);
    expect(hasAdultAnswersThrough(four, 10)).toBe(false);
  });
  it("finds a missing answer rather than counting populated fields", () => {
    expect(hasAdultAnswersThrough({ ...four, "4": { field: "text" } }, 4)).toBe(false);
    expect(adultResumeStep({ "1": four["1"], "3": four["3"] }, false)).toBe(1);
  });
  it("rejects unexpected question keys and oversized free text", () => {
    expect(adultDraftSchema.safeParse({ "11": { choice: "A" } }).success).toBe(false);
    expect(adultDraftSchema.safeParse({ "1": { choice: "A", field: "x".repeat(4000) } }).success).toBe(false);
  });
});
