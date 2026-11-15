import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/server";
import { shareTokenSchema } from "@/lib/totem-sharing";

export const readPublicShare = cache(async (token: string) => {
  if (!shareTokenSchema.safeParse(token).success) return null;
  const { data, error } = await createServiceClient().from("totem_shares")
    .select("token, display_name, slug, totem_name, excerpt").eq("token", token).maybeSingle();
  if (error) throw new Error("Unable to read shared totem");
  return data;
});
