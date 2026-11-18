import { z } from "zod";

export const adultIdentitySchema = z.object({
  animal: z.string().min(1).max(100),
  quality: z.string().min(1).max(100),
  identityPhrase: z.string().min(1).max(1000),
  secondaryAttributes: z.array(z.string().min(1).max(100)).min(1).max(8),
});
export type AdultIdentityData = z.infer<typeof adultIdentitySchema>;

export function adultIdentityEntries(identity: AdultIdentityData, lang: "fr" | "en") {
  const labels = lang === "en"
    ? ["Your totem animal", "Your main quality", "Your identity phrase", "Your secondary attributes"]
    : ["Votre animal totem", "Votre qualité principale", "Votre phrase identitaire", "Vos attributs secondaires"];
  return [identity.animal, identity.quality, identity.identityPhrase, identity.secondaryAttributes.join(" / ")]
    .map((value, index) => ({ label: labels[index], value }));
}
