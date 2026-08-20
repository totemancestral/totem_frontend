export const ADULT_QUESTION_IDS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
] as const;

export type AdultAnswerState = {
  choice?: "A" | "B" | "C" | "D";
  field?: string;
  skipped?: boolean;
};

export type AdultBackendAnswer = { questionId: string; answer: string };
export type AdultIndicators = Record<`q${number}_filled`, boolean>;

export function formatAdultAnswer(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const answer = value as AdultAnswerState;
  if (answer.skipped) return "skipped";
  return [answer.choice, answer.field?.trim()].filter(Boolean).join(" | ");
}

export function toAdultBackendAnswers(
  answers: Record<string, unknown>,
  complete = false,
): AdultBackendAnswer[] {
  const result = ADULT_QUESTION_IDS.map((questionId) => ({
    questionId,
    answer: formatAdultAnswer(answers[questionId.slice(1)]).trim(),
  }));
  return complete ? result : result.filter((answer) => answer.answer.length > 0);
}

export function adultIndicators(answers: Record<string, unknown>): AdultIndicators {
  return Object.fromEntries(
    ADULT_QUESTION_IDS.map((questionId) => {
      const state = answers[questionId.slice(1)] as AdultAnswerState | undefined;
      return [`${questionId}_filled`, Boolean(state?.field?.trim())];
    }),
  ) as AdultIndicators;
}
