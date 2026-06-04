import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Politique de confidentialite - Totem Ancestral",
  description: "Comment Totem Ancestral protege vos donnees personnelles.",
};

export default function Page() {
  return <PrivacyPage />;
}
