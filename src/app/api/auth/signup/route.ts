import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
import { sendAuthEmail } from "@/lib/services/auth-email";

type SignupPayload = {
  email?: string;
  password?: string;
  prenom?: string;
  locale?: string;
  redirectPath?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as SignupPayload;
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";
  const locale = payload.locale === "en" ? "en" : "fr";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
  }

  const redirectTo = `${getRequestOrigin(request)}${safeRedirectPath(payload.redirectPath, locale)}`;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo,
        data: { prenom: payload.prenom?.trim() || email.split("@")[0], langue: locale },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const actionLink = data.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json({ error: "Lien de confirmation indisponible" }, { status: 500 });
    }

    await sendAuthEmail({ email, actionLink, locale, type: "confirmation" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Inscription impossible" },
      { status: 500 },
    );
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
