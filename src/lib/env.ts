import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const isProduction = process.env.NODE_ENV === "production";

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    STRIPE_PRICE_ORIGINE: z.string().startsWith("price_").optional(),
    STRIPE_PRICE_ANCESTRAL: z.string().startsWith("price_").optional(),
    STRIPE_PRICE_FAMILLE: z.string().startsWith("price_").optional(),

    // Supabase — requis en production
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // R2
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: optionalUrl,

    // Resend
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    RESEND_FROM_NAME: z.string().optional(),

    // Microservices IA
    SENYCE_API_TEXTE: optionalUrl,
    SENYCE_API_IMAGE: optionalUrl,
    SENYCE_API_AUDIO: optionalUrl,
    SENYCE_API_KEY: z.string().optional(),

    // OpenAI
    OPENAI_API_KEY: z.string().optional(),

    // Anthropic / Claude
    ANTHROPIC_API_KEY: z.string().optional(),

    // Admin
    ADMIN_EMAIL: z.string().email().optional(),

    // URLs
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    SITE_URL: optionalUrl,
    TOTEM_BACKEND_URL: optionalUrl,
  })
  .superRefine((env, ctx) => {
    if (!isProduction) return;

    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
        message: "Required in production",
      });
    }

    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
        message: "Required in production",
      });
    }

    if (!env.SUPABASE_SERVICE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SERVICE_KEY"],
        message: "SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY is required in production",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
