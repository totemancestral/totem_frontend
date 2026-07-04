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
    ANTHROPIC_MODEL: z.string().optional(),
    ANTHROPIC_MODEL_JUNIOR: z.string().optional(),

    // Admin
    ADMIN_EMAIL: z.string().email().optional(),

    // URLs
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    SITE_URL: optionalUrl,
    TOTEM_BACKEND_URL: optionalUrl,
  })
  .superRefine((env, ctx) => {
    if (!isProduction) return;

    const required = (key: string, label: string, val: string | undefined) => {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${label} required in production`,
        });
      }
    };

    required("NEXT_PUBLIC_SUPABASE_URL", "Supabase URL", env.NEXT_PUBLIC_SUPABASE_URL);
    required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "Supabase anon key",
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    if (!env.SUPABASE_SERVICE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SERVICE_KEY"],
        message: "SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY required in production",
      });
    }

    required("STRIPE_SECRET_KEY", "Stripe secret key", env.STRIPE_SECRET_KEY);
    required("STRIPE_WEBHOOK_SECRET", "Stripe webhook secret", env.STRIPE_WEBHOOK_SECRET);
    required("STRIPE_PRICE_ORIGINE", "Stripe price Origine", env.STRIPE_PRICE_ORIGINE);
    required("STRIPE_PRICE_ANCESTRAL", "Stripe price Ancestral", env.STRIPE_PRICE_ANCESTRAL);
    required("STRIPE_PRICE_FAMILLE", "Stripe price Famille", env.STRIPE_PRICE_FAMILLE);

    required("R2_ACCOUNT_ID", "R2 account ID", env.R2_ACCOUNT_ID);
    required("R2_ACCESS_KEY_ID", "R2 access key ID", env.R2_ACCESS_KEY_ID);
    required("R2_SECRET_ACCESS_KEY", "R2 secret access key", env.R2_SECRET_ACCESS_KEY);
    required("R2_BUCKET_NAME", "R2 bucket name", env.R2_BUCKET_NAME);
    required("R2_PUBLIC_URL", "R2 public URL", env.R2_PUBLIC_URL);

    required("RESEND_API_KEY", "Resend API key", env.RESEND_API_KEY);
    required("RESEND_FROM_EMAIL", "Resend from email", env.RESEND_FROM_EMAIL);

    required("ADMIN_EMAIL", "Admin email", env.ADMIN_EMAIL);

    if (!env.TOTEM_BACKEND_URL) {
      const hasDirectTextProvider =
        Boolean(env.ANTHROPIC_API_KEY) || Boolean(env.SENYCE_API_KEY && env.SENYCE_API_TEXTE);

      if (!hasDirectTextProvider) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ANTHROPIC_API_KEY"],
          message:
            "ANTHROPIC_API_KEY or SENYCE_API_KEY + SENYCE_API_TEXTE required when TOTEM_BACKEND_URL is unset",
        });
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
