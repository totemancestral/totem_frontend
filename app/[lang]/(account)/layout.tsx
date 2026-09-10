import type { Metadata } from "next";

// Le parcours d'achat (connexion, inscription, paiement...) n'a aucune valeur
// de référencement et ne doit jamais apparaître dans un résultat de recherche.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Les pages "compte" (inscription, connexion...) ont leur propre mise en
// page complète (le panneau divisé photo/formulaire) — pas besoin de la
// nav ni du footer partagés avec (marketing). Ce layout reste minimal.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
