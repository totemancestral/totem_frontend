import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const backendConnectSrc = [
  "https://totem-backend-o3v4.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
];
try {
  if (process.env.TOTEM_BACKEND_URL) {
    backendConnectSrc.push(new URL(process.env.TOTEM_BACKEND_URL).origin);
  }
} catch {
  // URL invalide : on garde les origines connues.
}

const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:", "https:"],
  "media-src": ["'self'", "https:", "blob:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "https://api.stripe.com",
    ...Array.from(new Set(backendConnectSrc)),
  ],
  "frame-src": ["'self'", "https://js.stripe.com"],
  "frame-ancestors": ["'none'"],
};

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: Object.entries(cspDirectives)
      .map(([key, values]) => `${key} ${values.join(" ")}`)
      .join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
