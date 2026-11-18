import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { parentTokenSchema } from "@/lib/junior-parent";
import { parentBackend, parentCookieName, PARENT_COOKIE_PATH } from "@/lib/server/parent-relay";

export async function POST(request: Request) {
  const limited = await rateLimit(request, 30, 60_000, "parent.exchange");
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const token = parentTokenSchema.safeParse(body?.token);
  if (!token.success) return NextResponse.json({ code: "parent_link_expired" }, { status: 410 });
  const response = await parentBackend("status", { token: token.data });
  if (response.ok) {
    const payload = await response.clone().json();
    const id = z.uuid().safeParse(payload?.requestId);
    if (!id.success) return NextResponse.json({ code: "parent_unavailable" }, { status: 502 });
    response.cookies.set(parentCookieName(id.data), token.data, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 24 * 60 * 60, path: PARENT_COOKIE_PATH,
    });
  }
  return response;
}

export async function GET(request: Request) {
  const limited = await rateLimit(request, 30, 60_000, "parent.session");
  if (limited) return limited;
  const id = z.uuid().safeParse(new URL(request.url).searchParams.get("requestId"));
  if (!id.success) return NextResponse.json({ code: "parent_link_expired" }, { status: 410 });
  const token = (await cookies()).get(parentCookieName(id.data))?.value;
  if (!token) return NextResponse.json({ code: "parent_link_expired" }, { status: 410 });
  return parentBackend("status", { token });
}
