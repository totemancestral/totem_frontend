import { NextResponse } from "next/server";
import { createPublicAuthClient } from "@/lib/server-auth";
import { readEnvValue } from "@/lib/env-values";

type MagicPayload = {
  email?: string;
  locale?: string;
  redirectPath?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as MagicPayload;
  const email = payload.email?.trim().toLowerCase();
  const locale = payload.locale === "en" ? "en" : "fr";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const redirectTo = `${getRequestOrigin(request)}${safeRedirectPath(payload.redirectPath, locale)}`;

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
  const configured = (readEnvValue("NEXT_PUBLIC_SITE_URL") || readEnvValue("SITE_URL"))?.replace(
    /\/$/,
    "",
  );
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}

function safeRedirectPath(path: string | undefined, locale: "fr" | "en") {
  if (!path || !path.startsWith(`/${locale}/`)) return `/${locale}/domus_animi`;
  if (path.startsWith(`/${locale}/janua_vitae`)) return `/${locale}/domus_animi`;
  return path;
}
