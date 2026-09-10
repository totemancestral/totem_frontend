import type { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/**
 * Trace les actions admin destructrices/sensibles (relance de commande,
 * suppression...) dans admin_audit_log : sans ça, personne ne peut dire qui a
 * fait quoi en cas de litige ou d'incident, une fois plusieurs admins en jeu.
 * Best-effort : un échec d'écriture du log ne doit jamais bloquer l'action
 * admin elle-même.
 */
export async function logAdminAction(
  supabase: ReturnType<typeof createServiceClient>,
  admin: { userId: string; email: string },
  action: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_id: admin.userId,
    admin_email: admin.email,
    action,
    detail: (detail as unknown as Json) ?? null,
  });

  if (error) {
    console.error("[admin-audit] insert failed", action, error);
  }
}
