import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("oeuvres")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
