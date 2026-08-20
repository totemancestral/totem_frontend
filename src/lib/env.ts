import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const isProduction = process.env.NODE_ENV === "production";

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),

    // Supabase — requis en production
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // Resend (formulaire de contact)
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    RESEND_FROM_NAME: z.string().optional(),

    // Admin
    ADMIN_EMAIL: z.string().email().optional(),

    // URLs
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    SITE_URL: optionalUrl,
    TOTEM_BACKEND_URL: optionalUrl,

    // Rate-limit partagé (optionnel). Sans ces clés, repli in-memory par isolate.
    UPSTASH_REDIS_URL: optionalUrl,
    UPSTASH_REDIS_TOKEN: z.string().min(1).optional(),
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

    required("ADMIN_EMAIL", "Admin email", env.ADMIN_EMAIL);

    // Le pipeline de génération (texte/image/audio/PDF) est entièrement délégué au
    // backend NestJS : sans TOTEM_BACKEND_URL, le webhook Stripe et le checkout
    // n'ont aucun moteur de génération. Requis en production.
    required("TOTEM_BACKEND_URL", "Backend URL", env.TOTEM_BACKEND_URL);
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
