import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/server-auth";
import { getServerEnv } from "@/lib/env";

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

  let { data, error } = await supabase
    .from("commandes")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Si des commandes sont en attente de paiement avec un session_id Stripe, on reconcilie avec le backend
  const env = getServerEnv();
  const backendUrl = env.TOTEM_BACKEND_URL?.replace(/\/$/, "");
  const pendingOrders = (data || []).filter(
    (cmd) => cmd.statut === "en_attente_paiement" && Boolean(cmd.stripe_session_id),
  );

  if (backendUrl && pendingOrders.length > 0) {
    await Promise.allSettled(
      pendingOrders.map(async (cmd) => {
        try {
          await fetch(`${backendUrl}/orders/session/${encodeURIComponent(cmd.stripe_session_id)}`, {
            headers: { authorization: request.headers.get("authorization") ?? "" },
          });
        } catch {
          // ignore error on live sync
        }
      }),
    );

    // Recharger les commandes a jour
    const refreshed = await supabase
      .from("commandes")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false });

    if (!refreshed.error && refreshed.data) {
      data = refreshed.data;
    }
  }

  return NextResponse.json(data);
}
