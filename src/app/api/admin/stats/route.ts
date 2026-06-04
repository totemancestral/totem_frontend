import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Admin stats API will be connected in module M7" },
    { status: 501 },
  );
}
