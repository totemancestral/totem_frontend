import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
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

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    return NextResponse.json({ ok: true });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) return NextResponse.json({ ok: true });

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "recovery" });
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
