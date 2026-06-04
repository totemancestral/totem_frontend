import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  return NextResponse.json({
    received: true,
    note: "Stripe webhook verification will be connected in module M3",
  });
}
