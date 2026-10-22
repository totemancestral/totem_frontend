import type { StaticImageData } from "next/image";
import first from "@/public/images/seuil_0.png";
import second from "@/public/images/seuil_1.png";
import third from "@/public/images/seuil_2.png";
import fourth from "@/public/images/seuil_3.png";

// Next.js identifie ces fichiers par leur contenu : les remplacer renouvelle leur URL.
const images: Record<string, StaticImageData> = {
  "/images/seuil_0.png": first,
  "/images/seuil_1.png": second,
  "/images/seuil_2.png": third,
  "/images/seuil_3.png": fourth,
};

export function getSeuilImage(src: string): StaticImageData | string {
  return images[src] ?? src;
}
