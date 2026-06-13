import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Totem Ancestral",
  description: "Comment Totem Ancestral protège vos données personnelles.",
};

export default function Page() {
  return <PrivacyPage />;
}
