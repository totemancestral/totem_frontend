import { NextResponse } from "next/server";
import { retryAfterSeconds } from "@/lib/retry-after";

/** Preserve a backend quota/outage response instead of disguising it as 502. */
export function forwardRetryResponse(response: Response): NextResponse | null {
  if (response.status !== 429 && response.status !== 503) return null;
  const seconds = retryAfterSeconds(response);
  if (response.status === 503 && seconds === null) return null;
  return NextResponse.json({ error: response.status === 429 ? "rate_limit_exceeded" : "service_unavailable", ...(seconds === null ? {} : { retryAfter: seconds }) }, {
    status: response.status,
    headers: { "Cache-Control": "private, no-store", ...(seconds === null ? {} : { "Retry-After": String(seconds) }) },
  });
}
