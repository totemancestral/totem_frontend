import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createPublicAuthClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const recoverSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  // Limite basse : ce point d'accès envoie un email à une adresse arbitraire,
  // sans en vérifier la propriété — sans limite, il permettrait de harceler
  // n'importe quelle boîte mail de demandes de réinitialisation.
  const rateLimitResponse = await rateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = recoverSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const email = parsed.data.email;
  const locale = parsed.data.locale ?? "fr";

  // Ne jamais dériver l'origine de request.url/Host : ce lien de
  // réinitialisation de mot de passe part par email, un Host falsifié
  // l'empoisonnerait vers un domaine contrôlé par un attaquant.
  const origin = (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  // Le paramètre ?ref= n'est lu par aucune page : il garantit juste qu'un "?"
  // est déjà présent dans l'URL, pour que le template email puisse y
  // accrocher &token_hash=...&type=recovery sans le deviner.
  const redirectTo = `${origin}/${locale}/mot-de-passe-oublie?ref=email`;

  const supabase = createPublicAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (!error) return NextResponse.json({ ok: true });

  if (error.status === 429 || /rate limit/i.test(error.message)) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessaie dans quelques minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ error: "Email impossible à envoyer" }, { status: 500 });
}
