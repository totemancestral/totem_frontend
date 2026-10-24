import fr from "@/app/[lang]/dictionaries/admin.fr.json";
import en from "@/app/[lang]/dictionaries/admin.en.json";
import { formatInterface } from "@/lib/interface-copy";
import { interfaceCopy } from "@/lib/interface-copy";

// French source phrases are the shared keys in this isolated administration catalog.
export function adminText(lang: string, key: string, values: Record<string, string | number> = {}) {
  const catalog: Record<string, string> = lang === "en" ? en : fr;
  return formatInterface(Object.hasOwn(catalog, key) ? catalog[key] : key, values);
}

const statuses: Record<string, string> = {
  livree: "Livrée", paye: "Payée", en_generation: "En génération",
  en_attente_paiement: "En attente de paiement", erreur: "Erreur", remboursee: "Remboursée",
};
export function adminStatus(lang: string, status: string) {
  return adminText(lang, Object.hasOwn(statuses, status) ? statuses[status] : status);
}

export function adminLoadError(lang: string, status: number) {
  return adminText(lang, status === 401 ? "Session expirée. Reconnecte-toi." : status === 403 ? "Accès refusé." : "Erreur de chargement");
}

export function adminOffer(lang: string, offer: string) {
  const labels: Record<string, string> = interfaceCopy(lang).offers;
  return Object.hasOwn(labels, offer) ? labels[offer] : offer;
}
