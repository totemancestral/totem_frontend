import { z } from "zod";
import type { AdultAnswerState } from "./adult-answers";

export const PAYMENT_AFTER_QUESTION = 4;
export const ADULT_QUESTION_COUNT = 10;

export const adultDraftSchema = z.record(
  z.string().regex(/^(?:[1-9]|10)$/),
  z.object({
    choice: z.enum(["A", "B", "C", "D"]).optional(),
    field: z.string().max(3996).optional(),
    skipped: z.boolean().optional(),
  }),
);

export function hasAdultAnswersThrough(answers: Record<string, AdultAnswerState>, count: number) {
  return Array.from({ length: count }, (_, i) => i + 1).every(
    (number) => Boolean(answers[String(number)]?.choice) || (number === 6 && answers["6"]?.skipped === true),
  );
}

export function adultResumeStep(answers: Record<string, AdultAnswerState>, paid: boolean) {
  const count = paid ? ADULT_QUESTION_COUNT : PAYMENT_AFTER_QUESTION;
  for (let i = 0; i < count; i++) {
    if (!hasAdultAnswersThrough(answers, i + 1)) return i;
  }
  return count - 1;
}
