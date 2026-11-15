import { createServiceClient } from "@/lib/supabase/server";
import { shareTokenSchema } from "@/lib/totem-sharing";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  if (!shareTokenSchema.safeParse(token).success) return new Response(null, { status: 404, headers });
  const social = new URL(request.url).searchParams.get("format") === "social";
  const { data, error } = await createServiceClient().from("totem_shares")
    .select("preview_jpeg, social_jpeg").eq("token", token).maybeSingle();
  if (error) return new Response(null, { status: 503, headers });
  if (!data) return new Response(null, { status: 404, headers });
  const bytes = Buffer.from(social ? data.social_jpeg : data.preview_jpeg, "base64");
  return new Response(bytes, { headers: { ...headers, "Content-Type": "image/jpeg", "Content-Disposition": "inline" } });
}
