import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createPublicAuthClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  // Même limite que recover : ce point d'accès envoie un email à une adresse
  // arbitraire sans en vérifier la propriété.
  const rateLimitResponse = await rateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = magicLinkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const email = parsed.data.email;
  const locale = parsed.data.locale ?? "fr";

  const origin = (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectTo = `${origin}/${locale}/verification?next=${encodeURIComponent(`/${locale}/espace`)}`;

  const supabase = createPublicAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      // Un lien magique sert à se connecter, pas à créer un compte : ça reste
      // le rôle du parcours d'inscription (validation, métadonnées requises).
      shouldCreateUser: false,
    },
  });

  if (error?.status === 429 || /rate limit/i.test(error?.message ?? "")) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessaie dans quelques minutes." },
      { status: 429 },
    );
  }

  // Ne jamais révéler si l'email correspond à un compte existant : on renvoie
  // le même succès dans tous les cas (y compris "signups not allowed").
  return NextResponse.json({ ok: true });
}
