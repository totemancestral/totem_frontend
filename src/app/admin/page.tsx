import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Totem Ancestral",
};

export default function AdminPage() {
  return (
    <main
      className="min-h-screen px-5 py-24"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="max-w-5xl mx-auto card-totem">
        <p className="caption uppercase mb-4" style={{ color: "var(--or-ancestral)" }}>
          SENYCE PARTNERS
        </p>
        <h1 className="h-display text-4xl mb-4" style={{ color: "var(--or-ancestral)" }}>
          Tableau de bord admin
        </h1>
        <p className="quote-italic text-lg">
          Socle reserve au module M7: commandes, revenus, erreurs pipeline et relance manuelle.
        </p>
      </div>
    </main>
  );
}
