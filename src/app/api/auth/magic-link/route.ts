import { NextResponse } from "next/server";
import {
  createPublicAuthClient,
  createServiceClient,
  hasServiceAuthCredentials,
} from "@/lib/server-auth";
import { readEnvValue } from "@/lib/env-values";
import { sendAuthEmail } from "@/lib/services/auth-email";

type MagicPayload = {
  email?: string;
  locale?: string;
  redirectPath?: string;
};

const ADMIN_EMAIL = "contact@totem-ancestral.com";
const ADMIN_PATH = "/fgh55_fh";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as MagicPayload;
  const email = payload.email?.trim().toLowerCase();
  const locale = payload.locale === "en" ? "en" : "fr";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const redirectTo = `${getRequestOrigin(request)}${safeRedirectPath(payload.redirectPath, locale, email)}`;

  if (canSendManagedMagicLink()) {
    return sendManagedMagicLink({ email, locale, redirectTo });
  }

  const supabase = createPublicAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (!error) return NextResponse.json({ ok: true });

  if (error.status === 429 || /rate limit/i.test(error.message)) {
    return NextResponse.json(
      { error: "Trop de demandes. Reessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 500 });
}

async function sendManagedMagicLink({
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
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.warn("[auth/magic-link] managed magic link rejected", {
      status: error.status,
      code: error.code,
      message: error.message,
    });

    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Lien impossible a generer" }, { status: 500 });
  }

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "magic" });
  } catch (emailError) {
    console.error("[auth/magic-link] email failed", emailError);
    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function canSendManagedMagicLink() {
  return hasServiceAuthCredentials() && Boolean(readEnvValue("BREVO_API_KEY"));
}

function getRequestOrigin(request: Request) {
  const configured = readEnvValue("NEXT_PUBLIC_SITE_URL")?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}

function safeRedirectPath(path: string | undefined, locale: "fr" | "en", email: string) {
  if (email === ADMIN_EMAIL) return ADMIN_PATH;
  if (!path || !path.startsWith(`/${locale}/`)) return `/${locale}/domus_animi`;
  if (path.startsWith(`/${locale}/janua_vitae`)) return `/${locale}/domus_animi`;
  return path;
}
