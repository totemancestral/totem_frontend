import type { Metadata } from "next";
import { MentionsPage } from "@/components/pages/MentionsPage";

export const metadata: Metadata = {
  title: "Mentions légales - Totem Ancestral",
  description: "Mentions légales de Totem Ancestral.",
};

export default function Page() {
  return <MentionsPage />;
}
