import { NextResponse } from "next/server";
import {
  createPublicAuthClient,
  createServiceClient,
  hasServiceAuthCredentials,
} from "@/lib/server-auth";
import { sendAuthEmail } from "@/lib/services/auth-email";

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

  if (canSendManagedRecovery()) {
    return sendManagedRecoveryEmail({ email, locale, redirectTo });
  }

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

async function sendManagedRecoveryEmail({
  email,
  locale,
  redirectTo,
}: {
  email: string;
  locale: "fr" | "en";
  redirectTo: string;
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    if (/not found|does not exist/i.test(error.message)) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Lien impossible a generer" }, { status: 500 });
  }

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "recovery" });
  } catch (emailError) {
    console.error("[auth/recover] recovery email failed", emailError);
    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function canSendManagedRecovery() {
  return hasServiceAuthCredentials() && Boolean(process.env.BREVO_API_KEY);
}

function getRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}
