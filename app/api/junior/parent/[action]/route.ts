import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { parentBackend, parentCookieName } from "@/lib/server/parent-relay";

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "confirm" && action !== "checkout") return new NextResponse(null, { status: 404 });
  const limited = await rateLimit(request, 10, 60_000, `parent.${action}`);
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const id = z.uuid().safeParse(body?.requestId);
  if (!id.success) return NextResponse.json({ code: "parent_link_expired" }, { status: 410 });
  const token = (await cookies()).get(parentCookieName(id.data))?.value;
  if (!token) return NextResponse.json({ code: "parent_link_expired" }, { status: 410 });
  return parentBackend(action, { token, requestId: id.data });
}
