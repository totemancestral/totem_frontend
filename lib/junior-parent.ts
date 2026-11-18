import { z } from "zod";

export const PARENT_CONSENT_VERSION = "2026-11-17";
const choice = z.object({ choice: z.enum(["A", "B", "C", "D"]) });
export const juniorParentAnswersSchema = z.object({ "1": choice, "2": choice, "3": choice, "4": choice, "5": choice });
export type JuniorParentAnswers = z.infer<typeof juniorParentAnswersSchema>;
export const parentTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
