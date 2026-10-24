/** Keep authentication continuations within the current language on this site. */
export function safeRedirectPath(path: string | null | undefined, locale: "fr" | "en"): string {
  const fallback = `/${locale}/parcours`;
  if (!path || path.length > 2048 || /[\\\u0000-\u0020\u007f]/.test(path)) return fallback;
  // Reject encoded separators/control characters, including nested encodings.
  const pathname = path.split(/[?#]/, 1)[0];
  if (/%(?:2f|5c|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(pathname)) return fallback;
  if (!path.startsWith(`/${locale}/`)) return fallback;
  try {
    const base = "https://redirect.invalid";
    const url = new URL(path, base);
    if (url.origin !== base || !url.pathname.startsWith(`/${locale}/`)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
