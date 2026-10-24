/** Observation policy: no request is blocked until enforcement is reviewed. */
export function contentSecurityPolicy(options: {
  development: boolean;
  supabaseUrl?: string;
  backendUrl?: string;
}): string {
  function origin(value?: string): string[] {
    if (!value) return [];
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw new Error("Invalid CSP resource origin");
    }
    return [url.origin];
  }

  const supabase = origin(options.supabaseUrl);
  const assets = [...new Set([...supabase, ...origin(options.backendUrl)])];
  const sockets = supabase.map((value) => value.replace(/^http/, "ws"));
  return [
    "default-src 'self'",
    // Next's static HTML contains inline hydration scripts. A nonce requires
    // a separate review of dynamic rendering and caching before enforcement.
    `script-src 'self' 'unsafe-inline'${options.development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: ${assets.join(" ")}`,
    `media-src 'self' blob: ${assets.join(" ")}`,
    `connect-src 'self' ${[...assets, ...sockets, ...(options.development ? ["ws:", "wss:"] : [])].join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
  ].map((directive) => directive.trim()).join("; ");
}
