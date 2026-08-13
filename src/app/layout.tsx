import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../styles.css";

export const metadata: Metadata = {
  title: "Totem Ancestral",
  description: "Totem Ancestral, maison de creation d'oeuvres numeriques personnelles.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* La police d'affichage conditionne la largeur des titres : sans elle,
            le repli serif est nettement plus large et « TOTEM ANCESTRAL »
            deborde sa colonne. On la precharge pour qu'elle soit la des le
            premier rendu. */}
        <link
          rel="preload"
          href="/fonts/totem/BebasNeue-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
