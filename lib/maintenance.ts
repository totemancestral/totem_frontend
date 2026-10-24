import type { Locale } from "@/app/[lang]/dictionaries";

const content: Record<Locale, { eyebrow: string; title: string; subtitle: string; text: string }> = {
  fr: {
    eyebrow: "Le sanctuaire se recueille",
    title: "Maintenance en cours.",
    subtitle: "Nous peaufinons quelque chose pour vous.",
    text: "Le site est momentanément indisponible pendant une mise à jour. Merci de revenir dans quelques heures.",
  },
  en: {
    eyebrow: "The sanctuary is in meditation",
    title: "Under maintenance.",
    subtitle: "We're polishing something for you.",
    text: "The site is temporarily unavailable during an update. Please check back in a few hours.",
  },
};

/**
 * Page de maintenance servie par le middleware (voir proxy.ts), en 503.
 * Reprend le même langage visuel que le reste du site (voir Erreur404) :
 * fond nuit, sunburst tournant, filigrane géant, Cormorant Garamond + Inter.
 */
export function maintenanceHtml(locale: Locale, options: { endAt?: string; now?: number } = {}): string {
  const t = content[locale];
  const value = options.endAt?.trim();
  // Require an explicit time zone; never insert the raw configuration in HTML.
  const end = value && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? Date.parse(value) : NaN;
  let estimate = "";
  if (Number.isFinite(end)) {
    if (end <= (options.now ?? Date.now())) {
      estimate = locale === "fr"
        ? "La maintenance se prolonge. Merci de votre patience."
        : "Maintenance is taking longer than expected. Thank you for your patience.";
    } else {
      const date = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
        timeZone: "Africa/Lagos", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).format(end);
      estimate = locale === "fr"
        ? `Retour estimé le ${date} — heure de Lagos.`
        : `Expected back on ${date} — Lagos time.`;
    }
  }
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${t.title} — Totem Ancestral</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    color-scheme: dark;
    --nuit:#0D0D1A; --or:#C9A84C; --orpale:#EDD99A; --ivoire:#FEFCF0;
    --grisclair:#888888;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: var(--nuit);
    color: var(--ivoire);
    font-family: Inter, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .sunburst {
    position: absolute; left: 50%; top: 50%; z-index: 0;
    width: 900px; height: 900px; opacity: 0.2;
    transform: translate(-50%, -50%);
    animation: spin 150s linear infinite;
  }
  @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
  .watermark {
    position: absolute; left: 50%; top: 46%; z-index: 0;
    transform: translate(-50%, -50%);
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 300; font-size: 22rem; line-height: 1;
    color: var(--ivoire); opacity: 0.045; white-space: nowrap;
    pointer-events: none;
  }
  header {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 12px;
    padding: 36px 64px;
  }
  .brand { font-weight: 400; font-size: 12px; letter-spacing: 0.50em; text-transform: uppercase; color: var(--ivoire); }
  main {
    position: relative; z-index: 1;
    flex: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 22px; text-align: center; padding: 0 24px 96px;
  }
  .eyebrow { font-weight: 500; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--or); margin: 0; }
  h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300; font-size: 2.75rem; line-height: 1.15; color: var(--ivoire); margin: 0; max-width: 36rem; }
  .subtitle { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-weight: 400; font-size: 1.35rem; color: var(--orpale); margin: 0; max-width: 28rem; }
  .text { font-size: 0.9rem; color: var(--grisclair); line-height: 1.6; margin: 0; max-width: 24rem; }
  a { color: var(--or); text-decoration: none; }
  a:hover { color: var(--orpale); }
</style>
</head>
<body>
  <svg class="sunburst" viewBox="0 0 760 760">
    <g stroke="#C9A84C" stroke-width="1">
      <line x1="380" y1="380" x2="380" y2="40" opacity="0.10"/>
      <line x1="380" y1="380" x2="720" y2="380" opacity="0.10"/>
      <line x1="380" y1="380" x2="380" y2="720" opacity="0.10"/>
      <line x1="380" y1="380" x2="40" y2="380" opacity="0.10"/>
      <line x1="380" y1="380" x2="592" y2="88" opacity="0.07"/>
      <line x1="380" y1="380" x2="592" y2="672" opacity="0.07"/>
      <line x1="380" y1="380" x2="168" y2="672" opacity="0.07"/>
      <line x1="380" y1="380" x2="168" y2="88" opacity="0.07"/>
    </g>
  </svg>

  <span class="watermark" aria-hidden="true">TA</span>

  <header>
    <img src="/images/logo_totem_1.svg" alt="" width="26" height="26" />
    <span class="brand">Totem Ancestral</span>
  </header>

  <main>
    <img src="/images/logo_totem_1.svg" alt="" width="72" height="72" style="margin-bottom: 4px;" />
    <p class="eyebrow">${t.eyebrow}</p>
    <h1>${t.title}</h1>
    <p class="subtitle">${t.subtitle}</p>
    <p class="text">${estimate || t.text}</p>
  </main>
</body>
</html>`;
}
