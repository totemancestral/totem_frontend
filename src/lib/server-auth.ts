import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readEnvValue } from "@/lib/env-values";

export async function authenticateRequest(
  request: Request,
): Promise<{ userId: string; email: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 }) as NextResponse;
  }

  const token = authHeader.slice(7);
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Configuration Supabase manquante" },
      { status: 500 },
    ) as NextResponse;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 }) as NextResponse;
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
  };
}

export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();

  if (!url || !key) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createPublicAuthClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();

  if (!url || !key) {
    throw new Error("Missing Supabase public credentials");
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hasServiceAuthCredentials() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

function getSupabaseUrl() {
  return readEnvValue("NEXT_PUBLIC_SUPABASE_URL") || readEnvValue("SUPABASE_URL");
}

function getSupabasePublicKey() {
  return (
    readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    readEnvValue("SUPABASE_ANON_KEY") ||
    readEnvValue("SUPABASE_PUBLISHABLE_KEY")
  );
}

function getSupabaseServiceKey() {
  return readEnvValue("SUPABASE_SERVICE_KEY") || readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
}
