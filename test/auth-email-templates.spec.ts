import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Supabase bilingual email templates", () => {
  it.each([
    ["confirm-signup", "signup", "Confirm my account", "Confirmer mon compte"],
    ["reset-password", "recovery", "Choose a new password", "Choisir un nouveau mot de passe"],
    ["magic-link", "magiclink", "Sign in", "Me connecter"],
    ["change-email", "email_change", "Confirm my email address", "Confirmer mon adresse"],
  ])("keeps both %s languages and verification links intact", (name, type, english, french) => {
    const template = readFileSync(resolve("docs/emails", `${name}.html`), "utf8");
    const branches = template.match(/^\{\{ if eq \.Data\.langue "en" \}\}\s*([\s\S]*?)\{\{ else \}\}\s*([\s\S]*?)\{\{ end \}\}\s*$/);
    expect(branches).not.toBeNull();
    for (const [index, lang, label] of [[1, "en", english], [2, "fr", french]] as const) {
      const html = branches![index];
      expect(html).toContain(`lang="${lang}"`);
      expect(html).toContain(label);
      const links = [...html.matchAll(/href="(\{\{ \.RedirectTo \}\}[^\"]+)"/g)].map(match => match[1]);
      expect(links).toHaveLength(2);
      for (const link of links) {
        const url = new URL(link.replace("{{ .RedirectTo }}", `https://example.invalid/${lang}/verification?next=espace`).replace("{{ .TokenHash }}", "test-token").replaceAll("&amp;", "&"));
        expect(url.searchParams.get("type")).toBe(type);
        expect(url.searchParams.get("token_hash")).toBe("test-token");
        expect(url.pathname).toContain(`/${lang}/`);
      }
    }
    const subject = readFileSync(resolve("docs/emails", `${name}.subject.txt`), "utf8");
    expect(subject).toMatch(/^\{\{ if eq \.Data\.langue "en" \}\}.+\{\{ else \}\}.+\{\{ end \}\}\s*$/);
  });
});
