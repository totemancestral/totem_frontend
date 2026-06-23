import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
import { sendAuthEmail } from "@/lib/services/auth-email";

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

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    return NextResponse.json({ ok: true });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) return NextResponse.json({ ok: true });

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "magic" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 500 });
  }
}

function getRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}

function safeRedirectPath(path: string | undefined, locale: "fr" | "en") {
  if (!path || !path.startsWith(`/${locale}/`)) return `/${locale}/domus_animi`;
  if (path.startsWith(`/${locale}/janua_vitae`)) return `/${locale}/domus_animi`;
  return path;
}
