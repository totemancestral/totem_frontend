import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/offres")({
  head: () => ({
    meta: [
      { title: "Les offres — Totem Ancestral" },
      { name: "description", content: "Trois manières de recevoir l'œuvre Totem Ancestral, comparées en détail." },
      { property: "og:title", content: "Les offres — Totem Ancestral" },
      { property: "og:description", content: "Comparatif détaillé des trois offres Totem Ancestral." },
    ],
  }),
  component: OffersPage,
});

const rows: { label: string; values: (boolean | string)[] }[] = [
  { label: "Parchemin narratif (PDF)", values: [true, true, true] },
  { label: "Œuvre visuelle (PNG haute résolution)", values: [true, true, true] },
  { label: "Voix de l'ancêtre (MP3, 90s)", values: [false, true, true] },
  { label: "Certificat d'authenticité numéroté", values: [true, true, true] },
  { label: "Nombre de coffrets", values: ["1", "1", "3"] },
  { label: "Carte cadeau gratuite", values: [true, true, true] },
  { label: "Délai de livraison", values: ["15 min", "15 min", "30 min"] },
  { label: "Support prioritaire", values: [false, false, true] },
];

const offers = [
  { name: "Origine", price: "49€", featured: false },
  { name: "Ancestral", price: "89€", featured: true },
  { name: "Famille", price: "199€", featured: false },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check size={18} strokeWidth={1.5} color="var(--or-ancestral)" />
    ) : (
      <Minus size={16} strokeWidth={1.5} color="#555" />
    );
  }
  return <span style={{ color: "var(--ivoire)" }}>{v}</span>;
}

function OffersPage() {
  return (
    <>
      <PageHero
        title="Les offres"
        subtitle="Trois manières de recevoir l'œuvre. Pour soi, pour offrir, pour partager."
      />

      <section className="pb-20 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-5xl mx-auto">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-6 caption uppercase" />
                  {offers.map((o) => (
                    <th
                      key={o.name}
                      className="py-6 px-4 text-center"
                      style={{
                        background: o.featured ? "rgba(201,168,76,0.06)" : "transparent",
                        borderBottom: "1px solid rgba(201,168,76,0.3)",
                      }}
                    >
                      <div className="h-display text-2xl tracking-[0.08em] uppercase" style={{ color: "var(--ivoire)" }}>
                        {o.name}
                      </div>
                      <div className="h-display text-3xl mt-2" style={{ color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}>
                        {o.price}
                      </div>
                      {o.featured && (
                        <div className="caption uppercase mt-2" style={{ color: "var(--or-ancestral)" }}>
                          Le cœur de la collection
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b" style={{ borderColor: "rgba(201,168,76,0.12)" }}>
                    <td className="py-5 pr-4 text-sm md:text-base" style={{ color: "var(--ivoire)" }}>
                      {r.label}
                    </td>
                    {r.values.map((v, i) => (
                      <td
                        key={i}
                        className="py-5 px-4 text-center"
                        style={{
                          background: offers[i].featured ? "rgba(201,168,76,0.04)" : "transparent",
                        }}
                      >
                        <div className="flex justify-center">
                          <Cell v={v} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td />
                  {offers.map((o) => (
                    <td key={o.name} className="pt-8 px-4 text-center"
                      style={{ background: o.featured ? "rgba(201,168,76,0.04)" : "transparent" }}
                    >
                      <button className={o.featured ? "btn-primary w-full" : "btn-secondary w-full"}>
                        Choisir
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Totem Vivant */}
      <section className="pb-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
        <div className="max-w-3xl mx-auto card-totem text-center">
          <p className="caption uppercase mb-4" style={{ color: "var(--or-ancestral)" }}>
            Abonnement
          </p>
          <h2 className="h-display text-3xl md:text-4xl" style={{ color: "var(--ivoire)" }}>
            Totem Vivant
          </h2>
          <p className="quote-italic text-lg mt-4">
            Pour que votre œuvre continue de respirer.
          </p>
          <p className="text-[15px] leading-[1.8] mt-6" style={{ color: "rgba(254,252,240,0.85)" }}>
            Un message audio inédit de votre ancêtre, livré chaque saison.
            Quatre fois par an, votre œuvre s'enrichit d'une nouvelle parole.
          </p>
          <div className="h-display text-4xl mt-8" style={{ color: "var(--or-ancestral)" }}>
            +9€<span className="text-2xl"> / an</span>
          </div>
          <p className="caption mt-3">À ajouter à toute commande Ancestral ou Famille.</p>
        </div>
      </section>
    </>
  );
}
