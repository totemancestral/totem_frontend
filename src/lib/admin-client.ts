"use client";

import { supabase } from "@/integrations/supabase/client";

export async function hasAdminRole(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.warn("[admin] role check failed", error.message);
    return false;
  }

  return data?.role === "admin";
}
