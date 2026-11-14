import type { StaticImageData } from "next/image";
import first from "@/public/images/seuil_0.png";
import second from "@/public/images/seuil_1.png";
import third from "@/public/images/seuil_2.png";
import fourth from "@/public/images/seuil_3.png";
import firstPortrait from "@/public/images/seuil_0_portrait.png";
import secondPortrait from "@/public/images/seuil_1_portrait.png";
import thirdPortrait from "@/public/images/seuil_2_portrait.png";
import fourthPortrait from "@/public/images/seuil_3_portrait.png";

// Next.js identifie ces fichiers par leur contenu : les remplacer renouvelle leur URL.
const images: Record<string, StaticImageData> = {
  "/images/seuil_0.png": first,
  "/images/seuil_1.png": second,
  "/images/seuil_2.png": third,
  "/images/seuil_3.png": fourth,
};

const portraits: Record<string, StaticImageData> = {
  "/images/seuil_0.png": firstPortrait,
  "/images/seuil_1.png": secondPortrait,
  "/images/seuil_2.png": thirdPortrait,
  "/images/seuil_3.png": fourthPortrait,
};

export function getSeuilImage(src: string, orientation: "landscape" | "portrait" = "landscape"): StaticImageData | string {
  const variants = orientation === "portrait" ? portraits : images;
  return variants[src] ?? images[src] ?? src;
}
