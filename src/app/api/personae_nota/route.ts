import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/server-auth";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { authorization: request.headers.get("authorization") ?? "" } },
  });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({
        prenom: null,
        nom: null,
        sexe: null,
        email: auth.email,
        langue: "fr",
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 422 });
  }

  const { prenom, nom, sexe, langue } = body as {
    prenom?: string;
    nom?: string;
    sexe?: string;
    langue?: string;
  };

  if (sexe !== undefined && sexe !== "homme" && sexe !== "femme") {
    return NextResponse.json({ error: "Sexe invalide" }, { status: 422 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { authorization: request.headers.get("authorization") ?? "" } },
  });

  const update: Record<string, string> = {};
  if (prenom !== undefined) update.prenom = prenom;
  if (nom !== undefined) update.nom = nom;
  if (sexe !== undefined) update.sexe = sexe;
  if (langue !== undefined) update.langue = langue;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien a mettre a jour" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: auth.userId, email: auth.email, ...update })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
