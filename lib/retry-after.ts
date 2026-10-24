import { formatInterface, interfaceCopy } from "@/lib/interface-copy";
/** Read either delta-seconds or an HTTP date; never invent a server delay. */
export function retryAfterSeconds(response: Pick<Response, "headers">, now = Date.now()): number | null {
  const raw = response.headers.get("Retry-After")?.trim();
  if (!raw) return null;
  let seconds: number;
  if (/^\d+$/.test(raw)) seconds = Number(raw);
  else if (/^[A-Za-z]{3}, /.test(raw)) seconds = Math.ceil((Date.parse(raw) - now) / 1000);
  else return null;
  return Number.isSafeInteger(seconds) && seconds >= 0 && seconds <= 604800 ? Math.max(1, seconds) : null;
}

function message(status: number, seconds: number | null, lang: "fr" | "en") {
  if (status !== 429 && (status !== 503 || seconds === null)) return null;
  const copy = interfaceCopy(lang).retry;
  const lead = status === 429 ? copy.limited : copy.unavailable;
  if (seconds === null) return `${lead} ${copy.later}`;
  return `${lead} ${formatInterface(seconds === 1 ? copy.one : copy.many, { seconds })}`;
}

export function retryNotice(response: Pick<Response, "status" | "headers">, lang: "fr" | "en"): string | null {
  return message(response.status, retryAfterSeconds(response), lang);
}

export class RetryAfterError extends Error {
  readonly status: number;
  readonly seconds: number | null;
  constructor(response: Pick<Response, "status" | "headers">) {
    super("retry_later");
    this.status = response.status;
    this.seconds = retryAfterSeconds(response);
  }
  localized(lang: "fr" | "en") { return message(this.status, this.seconds, lang); }
}
export function retryErrorNotice(error: unknown, lang: "fr" | "en"): string | null {
  return error instanceof RetryAfterError ? error.localized(lang) : null;
}
