import { NextResponse } from "next/server";
import { createPublicAuthClient } from "@/lib/server-auth";

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

function getRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
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
