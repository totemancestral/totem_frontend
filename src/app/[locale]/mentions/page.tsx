import type { Metadata } from "next";
import { MentionsPage } from "@/components/pages/MentionsPage";

export const metadata: Metadata = {
  title: "Mentions legales - Totem Ancestral",
  description: "Mentions legales de Totem Ancestral.",
};

export default function Page() {
  return <MentionsPage />;
}
