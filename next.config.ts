import type { NextConfig } from "next";

const securityHeaders = [
  // Interdit l'affichage du site dans une <iframe> tierce (protection clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de deviner un type MIME différent de celui déclaré.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // N'envoie l'URL complète comme referrer qu'en HTTPS→HTTPS same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive des API sensibles par défaut (caméra, micro, géoloc) tant
  // qu'aucune fonctionnalité du site n'en a besoin.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Sans effet en HTTP (dev local) : les navigateurs n'appliquent HSTS
  // qu'après l'avoir reçu sur une réponse HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Masque le badge "N" affiché en bas à gauche pendant le développement.
  devIndicators: false,
  // Retire l'en-tête "X-Powered-By: Next.js" (fingerprinting facile de la stack).
  poweredByHeader: false,
  // Next.js bloque par défaut les requêtes cross-origin vers les assets du
  // serveur de dev (/_next/*) : sans ça, ouvrir le site via l'IP réseau
  // (ex: depuis un téléphone sur le même Wi-Fi) charge la page mais casse
  // tout le CSS/JS, qui sont refusés comme venant d'une origine étrangère.
  allowedDevOrigins: ["192.168.1.66", "192.168.1.70", "192.168.1.67"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
