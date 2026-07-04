import { forwardRef } from "react";
import type { TotemData } from "@/lib/totem";
import parcheminOuvert from "@/assets/parchemin_ouvert.png";
import { Seal } from "./Seal";

/**
 * Document 3 pages rendu HORS ÉCRAN puis capturé par html2canvas -> jsPDF.
 * Format A4 portrait à 96dpi (794 x 1123 px). Fidélité visuelle maximale.
 */

const PAGE_W = 794;
const PAGE_H = 1123;

function PdfPage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pdf-page"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        position: "relative",
        background: "linear-gradient(160deg, #0d0d12, #08080b)",
        padding: 26,
        boxSizing: "border-box",
      }}
    >
      {/* Cadre sombre extérieur */}
      <div
        style={{
          position: "absolute",
          inset: 14,
          border: "2px solid var(--gold-dark)",
          boxShadow: "inset 0 0 0 1px rgba(212,169,74,0.25)",
          borderRadius: 4,
        }}
      />
      {/* Parchemin */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundImage: `url(${parcheminOuvert})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "11%",
            bottom: "11%",
            left: "13%",
            right: "13%",
            display: "flex",
            flexDirection: "column",
            color: "var(--ink)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const H = ({ children, size = 34 }: { children: React.ReactNode; size?: number }) => (
  <h2
    style={{
      fontFamily: "var(--font-serif)",
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#2c1d0c",
      textAlign: "center",
      margin: 0,
    }}
  >
    {children}
  </h2>
);

const Hand = ({ children, size = 27 }: { children: React.ReactNode; size?: number }) => (
  <p
    style={{
      fontFamily: "var(--font-hand)",
      fontSize: size,
      lineHeight: 1.55,
      color: "var(--ink)",
      margin: "0 0 14px 0",
    }}
  >
    {children}
  </p>
);

const Rule = () => (
  <div
    style={{
      height: 2,
      width: 120,
      margin: "10px auto",
      background: "linear-gradient(90deg, transparent, var(--gold-dark), transparent)",
    }}
  />
);

export const ParchmentPdfDocument = forwardRef<HTMLDivElement, { data: TotemData }>(
  ({ data }, ref) => {
    const half = Math.ceil(data.sections.length / 2);
    const page2 = data.sections.slice(0, half);
    const page3 = data.sections.slice(half);

    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          zIndex: -1,
        }}
      >
        {/* PAGE 1 — Couverture */}
        <PdfPage>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <H size={40}>Totem Ancestral</H>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 18,
                color: "#5a4526",
                marginTop: 6,
              }}
            >
              {data.subtitle}
            </p>
            <Rule />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <img
              src={data.totemImage}
              alt={data.totemName}
              style={{
                width: 300,
                height: "auto",
                filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
              }}
            />
            <H size={26}>{data.totemName}</H>
            <p
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: 30,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Préparé pour {data.userName}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 6 }}>
            <Seal size={90} />
          </div>
        </PdfPage>

        {/* PAGE 2 — Le récit */}
        <PdfPage>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <H>Le Récit</H>
            <Rule />
          </div>
          <div style={{ flex: 1, marginTop: 10 }}>
            {page2.map((s) => (
              <div key={s.title} style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#5a4526",
                    margin: "0 0 6px 0",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.title}
                </h3>
                {s.paragraphs.map((p, i) => (
                  <Hand key={i}>{p}</Hand>
                ))}
              </div>
            ))}
          </div>
        </PdfPage>

        {/* PAGE 3 — Fin & clôture */}
        <PdfPage>
          <div style={{ flex: 1, marginTop: 8 }}>
            {page3.map((s) => (
              <div key={s.title} style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#5a4526",
                    margin: "0 0 6px 0",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.title}
                </h3>
                {s.paragraphs.map((p, i) => (
                  <Hand key={i}>{p}</Hand>
                ))}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <H size={26}>Insigne</H>
            <Rule />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <Seal size={96} />
            </div>
          </div>
        </PdfPage>
      </div>
    );
  },
);
ParchmentPdfDocument.displayName = "ParchmentPdfDocument";
