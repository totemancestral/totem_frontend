import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const isProduction = process.env.NODE_ENV === "production";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Stripe — requis en production
  STRIPE_SECRET_KEY: isProduction
    ? z.string().startsWith("sk_")
    : z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: isProduction
    ? z.string().startsWith("whsec_")
    : z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_ORIGINE: isProduction
    ? z.string().startsWith("price_")
    : z.string().startsWith("price_").optional(),
  STRIPE_PRICE_ANCESTRAL: isProduction
    ? z.string().startsWith("price_")
    : z.string().startsWith("price_").optional(),
  STRIPE_PRICE_FAMILLE: isProduction
    ? z.string().startsWith("price_")
    : z.string().startsWith("price_").optional(),

  // Supabase — requis en production
  NEXT_PUBLIC_SUPABASE_URL: isProduction
    ? z.string().url()
    : z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: isProduction
    ? z.string().min(1)
    : z.string().optional(),
  SUPABASE_SERVICE_KEY: isProduction
    ? z.string().min(1)
    : z.string().optional(),

  // R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: optionalUrl,

  // Brevo
  BREVO_API_KEY: z.string().optional(),
  BREVO_TEMPLATE_CONFIRM_FR: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_CONFIRM_EN: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_LIVRAISON_FR: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_LIVRAISON_EN: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_ALERTE_ADMIN: z.coerce.number().positive().optional(),

  // Microservices IA
  SENYCE_API_TEXTE: optionalUrl,
  SENYCE_API_IMAGE: optionalUrl,
  SENYCE_API_AUDIO: optionalUrl,
  SENYCE_API_KEY: z.string().optional(),

  // Anthropic / Claude
  ANTHROPIC_API_KEY: z.string().optional(),

  // Admin
  ADMIN_EMAIL: z.string().email().optional(),

  // URLs
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  TOTEM_BACKEND_URL: optionalUrl,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
