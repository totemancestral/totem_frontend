import { NextResponse } from "next/server";
import {
  createPublicAuthClient,
  createServiceClient,
  hasServiceAuthCredentials,
} from "@/lib/server-auth";
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
  const metadata: { prenom: string; langue: "fr" | "en" } = {
    prenom: payload.prenom?.trim() || email.split("@")[0],
    langue: locale,
  };

  try {
    if (canSendManagedConfirmation()) {
      return await signupWithManagedConfirmation({ email, password, locale, redirectTo, metadata });
    }

    const supabase = createPublicAuthClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: metadata,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Inscription impossible" },
      { status: 500 },
    );
  }
}

async function signupWithManagedConfirmation({
  email,
  password,
  locale,
  redirectTo,
  metadata,
}: {
  email: string;
  password: string;
  locale: "fr" | "en";
  redirectTo: string;
  metadata: { prenom: string; langue: "fr" | "en" };
}) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo,
      data: metadata,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const actionLink = data.properties?.action_link;
  const userId = data.user?.id;

  if (!actionLink || !userId) {
    return NextResponse.json(
      { error: "Lien de confirmation impossible a generer" },
      { status: 500 },
    );
  }

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "confirmation" });
  } catch (emailError) {
    console.error("[auth/signup] confirmation email failed", emailError);
    await supabase.auth.admin.deleteUser(userId).catch((deleteError) => {
      console.error("[auth/signup] created user cleanup failed", deleteError);
    });
    return NextResponse.json(
      { error: "Email de confirmation impossible a envoyer" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function canSendManagedConfirmation() {
  return hasServiceAuthCredentials() && Boolean(process.env.BREVO_API_KEY);
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
