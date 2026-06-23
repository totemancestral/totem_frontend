import { NextResponse } from "next/server";
import { createPublicAuthClient } from "@/lib/server-auth";

type RecoverPayload = {
  email?: string;
  locale?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as RecoverPayload;
  const email = payload.email?.trim().toLowerCase();
  const locale = payload.locale === "en" ? "en" : "fr";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const origin = getRequestOrigin(request);
  const redirectTo = `${origin}/${locale}/renovare_clavis`;

  const supabase = createPublicAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (!error) return NextResponse.json({ ok: true });

  if (error.status === 429 || /rate limit/i.test(error.message)) {
    return NextResponse.json(
      { error: "Trop de demandes. Reessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 500 });
}

function getRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}
