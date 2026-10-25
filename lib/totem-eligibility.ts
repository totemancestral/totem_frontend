export function totemConflictMessage(code: unknown, lang: string): string | null {
  const en = lang === "en";
  if (code === "totem_already_exists") return en
    ? "Your account already has its Totem. Find it in your personal space."
    : "Ton compte possède déjà son Totem. Retrouve-le dans ton espace personnel.";
  if (code === "totem_order_in_progress") return en
    ? "A paid or ongoing order already exists. Resume it from your personal space without paying again."
    : "Une commande payée ou en cours existe déjà. Reprends-la depuis ton espace personnel, sans repayer.";
  if (code === "totem_checkout_in_progress") return en
    ? "A payment request is already being prepared. Wait a moment before trying again."
    : "Une demande de paiement est déjà en préparation. Patiente un instant avant de réessayer.";
  return null;
}
