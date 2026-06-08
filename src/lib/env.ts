import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

export const serverEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_ORIGINE: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_ANCESTRAL: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_FAMILLE: z.string().startsWith("price_").optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: optionalUrl,
  BREVO_API_KEY: z.string().optional(),
  BREVO_TEMPLATE_CONFIRM_FR: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_CONFIRM_EN: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_LIVRAISON_FR: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_LIVRAISON_EN: z.coerce.number().positive().optional(),
  BREVO_TEMPLATE_ALERTE_ADMIN: z.coerce.number().positive().optional(),
  SENYCE_API_TEXTE: optionalUrl,
  SENYCE_API_IMAGE: optionalUrl,
  SENYCE_API_AUDIO: optionalUrl,
  SENYCE_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  TOTEM_BACKEND_URL: optionalUrl,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
