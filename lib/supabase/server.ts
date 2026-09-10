import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getServerEnv } from "@/lib/env";

// Authentifie une requête API à partir du header "Authorization: Bearer <jwt>"
// émis par le client Supabase côté navigateur. Retourne soit l'utilisateur,
// soit une NextResponse d'erreur prête à être renvoyée telle quelle.
export async function authenticateRequest(
  request: Request,
): Promise<{ userId: string; email: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const env = getServerEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  return { userId: data.user.id, email: data.user.email ?? "" };
}

// Décode le claim "aal" (Authenticator Assurance Level) d'un JWT Supabase
// sans appel réseau : aal1 = mot de passe seul, aal2 = 2FA validée pour
// cette session. Pas de vérification de signature ici — le jeton a déjà été
// validé par authenticateRequest() juste avant.
function decodeJwtAal(token: string): "aal1" | "aal2" | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as { aal?: string };
    return json.aal === "aal2" ? "aal2" : json.aal === "aal1" ? "aal1" : null;
  } catch {
    return null;
  }
}

// Authentifie la requête, vérifie le rôle admin (table user_roles) ET exige
// une session 2FA (aal2) dès qu'un facteur TOTP vérifié existe sur le compte.
// Réservé aux routes /api/admin/*.
export async function requireAdmin(
  request: Request,
): Promise<{ userId: string; email: string } | NextResponse> {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Vérification du rôle admin impossible" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Accès admin requis" }, { status: 403 });
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(auth.userId);
  if (userError) {
    return NextResponse.json({ error: "Vérification 2FA impossible" }, { status: 500 });
  }
  const hasVerifiedTotp = (userData.user?.factors ?? []).some(
    (f) => f.factor_type === "totp" && f.status === "verified",
  );

  if (hasVerifiedTotp) {
    const token = request.headers.get("authorization")!.slice(7);
    if (decodeJwtAal(token) !== "aal2") {
      return NextResponse.json({ error: "mfa_required" }, { status: 401 });
    }
  }

  return auth;
}

// Client Supabase avec la clé service_role : contourne les policies RLS,
// réservé aux routes API serveur qui ont déjà vérifié l'utilisateur.
export function createServiceClient() {
  const env = getServerEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Configuration Supabase (service role) manquante");
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Client Supabase anonyme côté serveur (signup/signin/reset) : mêmes droits
// qu'un visiteur non connecté, utile dans une route API sans passer par le
// SDK navigateur.
export function createPublicAuthClient() {
  const env = getServerEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
