import type { StorySection, AdultTotemProfile, JuniorTotemProfile } from "@/lib/totem-v3";

export type TotemRevealData = {
  userName: string;
  totemName: string;
  totemImage: string;
  subtitle: string;
  sections: StorySection[];
  numeroSerie?: string;
  audioUrl?: string;
  pdfUrl?: string;
  onShare?: () => void;
  onClan?: () => void;
  onBack?: () => void;
};

export function adultProfileToRevealData(
  profile: AdultTotemProfile,
  sections: StorySection[],
  imageUrl: string,
  numeroSerie?: string,
): TotemRevealData {
  return {
    userName: profile.firstName,
    totemName: profile.nomComplet,
    totemImage: imageUrl,
    subtitle: profile.workTitleFr,
    sections,
    numeroSerie,
  };
}

export function juniorProfileToRevealData(
  profile: JuniorTotemProfile,
  imageUrl: string,
): TotemRevealData {
  return {
    userName: profile.firstName,
    totemName: profile.nomComplet,
    totemImage: imageUrl,
    subtitle: profile.totem.quality,
    sections: [],
  };
}
