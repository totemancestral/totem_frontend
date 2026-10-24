import { getServerEnv } from "@/lib/env";
import { retryAfterSeconds } from "@/lib/retry-after";

export type RetryResult = {
  commandeId: string;
  status: "ok" | "ko" | "not_attempted";
  outcome?: "accepted" | "already_running" | "already_done";
  error?: string;
};
export type RetryReply = { result: RetryResult; status: number; retryAfter?: number };

/** The backend owns state changes. This relay never resets artwork or deletes errors. */
export async function requestAdminRetry(request: Request, commandeId: string): Promise<RetryReply> {
  const url = getServerEnv().TOTEM_BACKEND_URL;
  if (!url) return { result: { commandeId, status: "ko", error: "backend_unavailable" }, status: 503 };
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/orders/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") ?? "" },
      body: JSON.stringify({ externalCommandId: commandeId }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
      cache: "no-store",
    });
    if (!response.ok) {
      return { result: { commandeId, status: "ko", error: "backend_retry_failed" },
        status: [400, 401, 403, 404, 409, 429, 503].includes(response.status) ? response.status : 502,
        ...([429, 503].includes(response.status) ? { retryAfter: retryAfterSeconds(response) ?? undefined } : {}),
      };
    }
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload.orderId !== "string" || !payload.orderId || typeof payload.queued !== "boolean") {
      return { result: { commandeId, status: "ko", error: "invalid_backend_response" }, status: 502 };
    }
    const outcome = !payload.queued ? "already_done" : payload.outcome === "already_running" ? "already_running" : "accepted";
    return { result: { commandeId, status: "ok", outcome }, status: 200 };
  } catch {
    // A timeout does not prove cancellation: the backend may have durably reserved the job.
    return { result: { commandeId, status: "ko", error: "backend_unreachable" }, status: 502 };
  }
}

export function retryHeaders(retryAfter?: number) {
  return { "Cache-Control": "private, no-store", ...(retryAfter === undefined ? {} : { "Retry-After": String(retryAfter) }) };
}
