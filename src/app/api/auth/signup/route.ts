import { NextResponse } from "next/server";
import {
  createPublicAuthClient,
  createServiceClient,
  hasServiceAuthCredentials,
} from "@/lib/server-auth";
import { readEnvValue } from "@/lib/env-values";
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
      logAuthError("signup rejected", error);

      if (isExistingAccountError(error.message)) {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: redirectTo },
        });

        if (!resendError) {
          return NextResponse.json({ ok: true, resent: true });
        }

        logAuthError("confirmation resend rejected", resendError);

        if (isAlreadyConfirmedError(resendError.message)) {
          return NextResponse.json(
            { error: "Un compte existe deja avec cet email. Connecte-toi." },
            { status: 409 },
          );
        }

        return NextResponse.json(
          { error: normalizeAuthError(resendError.message), code: "confirmation_resend_failed" },
          { status: statusFromAuthError(resendError) },
        );
      }

      return NextResponse.json(
        { error: normalizeAuthError(error.message) },
        { status: statusFromAuthError(error) },
      );
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
    logAuthError("managed signup rejected", error);

    if (isExistingAccountError(error.message)) {
      return sendManagedMagicLink({ email, locale, redirectTo });
    }

    return NextResponse.json(
      { error: normalizeAuthError(error.message) },
      { status: statusFromAuthError(error) },
    );
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
    logAuthError("managed existing account link rejected", error);
    return NextResponse.json(
      { error: "Un compte existe deja avec cet email. Connecte-toi." },
      { status: 409 },
    );
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Lien impossible a generer" }, { status: 500 });
  }

  try {
    await sendAuthEmail({ email, actionLink, locale, type: "magic" });
  } catch (emailError) {
    console.error("[auth/signup] existing account email failed", emailError);
    return NextResponse.json({ error: "Email impossible a envoyer" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, resent: true });
}

function canSendManagedConfirmation() {
  return hasServiceAuthCredentials() && Boolean(readEnvValue("BREVO_API_KEY"));
}

function isExistingAccountError(message: string) {
  return /already registered|already exists|user already|email.*exists/i.test(message);
}

function isAlreadyConfirmedError(message: string) {
  return /already confirmed|confirmed already|user.*confirmed/i.test(message);
}

function normalizeAuthError(message: string) {
  if (/rate limit/i.test(message)) return "Trop de tentatives. Reessayez dans quelques minutes.";
  if (/password/i.test(message)) return "Mot de passe trop court, minimum 6 caracteres.";
  if (/email/i.test(message)) return message;
  return message || "Inscription impossible";
}

function statusFromAuthError(error: { status?: number; message?: string }) {
  if (error.status === 429 || /rate limit/i.test(error.message ?? "")) return 429;
  if (error.status && error.status >= 400 && error.status < 500) return error.status;
  return 400;
}

function logAuthError(label: string, error: { status?: number; code?: string; message?: string }) {
  console.warn(`[auth/signup] ${label}`, {
    status: error.status,
    code: error.code,
    message: error.message,
  });
}

function getRequestOrigin(request: Request) {
  const configured = readEnvValue("NEXT_PUBLIC_SITE_URL")?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}

function safeRedirectPath(path: string | undefined, locale: "fr" | "en") {
  if (!path || !path.startsWith(`/${locale}/`)) return `/${locale}/domus_animi`;
  if (path.startsWith(`/${locale}/janua_vitae`)) return `/${locale}/domus_animi`;
  return path;
}
