import { z } from "zod";
import { parchmentParagraphs } from "@/lib/parchment-text";

export const shareTokenSchema = z.uuid();
export const shareInputSchema = z.object({
  displayName: z.string().trim().min(1).max(40)
    .regex(/^[\p{L}\p{M}\p{N} '\u2019-]+$/u),
});

export function shareSlug(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "totem";
}

export function shareExcerpt(story: string) {
  const text = (parchmentParagraphs(story)[0] ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= 280) return text;
  return `${text.slice(0, 279).replace(/\s+\S*$/, "").trimEnd()}…`;
}

export function shareTitle(name: string, totem: string, lang: string) {
  return lang === "en" ? `${name}’s totem — ${totem}` : `Le totem de ${name} — ${totem}`;
}

export function sharePath(lang: string, slug: string, token: string) {
  return `/${lang === "en" ? "en" : "fr"}/totem/${slug}/${token}`;
}
