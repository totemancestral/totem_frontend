import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createPublicAuthClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
  prenom: z.string().trim().max(80).optional(),
  nom: z.string().trim().max(80).optional(),
  sexe: z.enum(["homme", "femme"]).optional(),
  locale: z.enum(["fr", "en"]).optional(),
  redirectPath: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const rateLimitResponse = await rateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 422 });
  }
  const payload = parsed.data;
  const email = payload.email;
  const password = payload.password;
  const locale = payload.locale ?? "fr";

  const metadata = {
    prenom: payload.prenom || email.split("@")[0],
    nom: payload.nom ?? "",
    sexe: payload.sexe ?? "",
    langue: locale,
  };

  const nextPath = safeRedirectPath(payload.redirectPath, locale);
  const redirectTo = `${getRequestOrigin()}/${locale}/verification?next=${encodeURIComponent(nextPath)}`;

  try {
    const supabase = createPublicAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo, data: metadata },
    });

    if (error) {
      console.warn("[auth/signup] rejected", { status: error.status, message: error.message });
      return NextResponse.json({ error: normalizeAuthError(error.message) }, { status: statusFromAuthError(error) });
    }

    // Si la confirmation email est désactivée sur le projet Supabase,
    // signUp() renvoie directement une session exploitable.
    return NextResponse.json({
      ok: true,
      sessionReady: Boolean(data.session),
      accessToken: data.session?.access_token ?? null,
      refreshToken: data.session?.refresh_token ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Inscription impossible" },
      { status: 500 },
    );
  }
}

function normalizeAuthError(message: string) {
  if (/already registered|already exists|user already/i.test(message)) {
    return "Un compte existe déjà avec cet email. Connecte-toi.";
  }
  if (/rate limit/i.test(message)) return "Trop de tentatives. Réessaie dans quelques minutes.";
  if (/password/i.test(message)) return "Mot de passe trop court, minimum 8 caractères.";
  return message || "Inscription impossible";
}

function statusFromAuthError(error: { status?: number; message?: string }) {
  if (error.status === 429 || /rate limit/i.test(error.message ?? "")) return 429;
  if (error.status && error.status >= 400 && error.status < 500) return error.status;
  return 400;
}

function getRequestOrigin() {
  // Ne jamais dériver l'origine de request.url/Host : cet en-tête est fourni
  // par le client et une mauvaise configuration de proxy pourrait le laisser
  // le falsifier, empoisonnant le lien de confirmation envoyé par email.
  return (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function safeRedirectPath(path: string | undefined, locale: "fr" | "en") {
  const fallback = `/${locale}/parcours`;
  if (!path || !path.startsWith(`/${locale}/`)) return fallback;
  return path;
}
