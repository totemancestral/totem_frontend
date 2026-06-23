import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "contact@totem-ancestral.com").toLowerCase();

export async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const auth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await auth.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acces admin requis" }, { status: 403 });
  }

  return { user, token };
}
