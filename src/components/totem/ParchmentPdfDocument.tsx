"use client";

import { forwardRef } from "react";
import type { StorySection } from "@/lib/totem-v3";

type PdfDocumentData = {
  userName: string;
  totemName: string;
  totemImage: string;
  subtitle: string;
  sections: StorySection[];
};

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
      <div
        style={{
          position: "absolute",
          inset: 14,
          border: "2px solid #8A6A2B",
          boxShadow: "inset 0 0 0 1px rgba(212,169,74,0.25)",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundImage: "url(/assets/totem/parchemin_ouvert.png)",
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
            color: "#2c1d0c",
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
      fontFamily: "Times-Roman, serif",
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
      fontFamily: "Georgia, serif",
      fontSize: size,
      lineHeight: 1.55,
      color: "#2c1d0c",
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
      background: "linear-gradient(90deg, transparent, #8A6A2B, transparent)",
    }}
  />
);

export const ParchmentPdfDocument = forwardRef<HTMLDivElement, { data: PdfDocumentData }>(
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
        <PdfPage>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <H size={40}>Totem Ancestral</H>
            <p
              style={{
                fontFamily: "Times-Roman, serif",
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
                fontFamily: "Georgia, serif",
                fontSize: 30,
                color: "#2c1d0c",
                margin: 0,
              }}
            >
              Prepare pour {data.userName}
            </p>
          </div>
        </PdfPage>

        <PdfPage>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <H>Le Recit</H>
            <Rule />
          </div>
          <div style={{ flex: 1, marginTop: 10 }}>
            {page2.map((s) => (
              <div key={s.title} style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: "Times-Roman, serif",
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

        {page3.length > 0 && (
          <PdfPage>
            <div style={{ flex: 1, marginTop: 8 }}>
              {page3.map((s) => (
                <div key={s.title} style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      fontFamily: "Times-Roman, serif",
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
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#9e1b13",
                  margin: "12px auto 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFCD6E",
                }}
              >
                <span
                  style={{
                    color: "#FFCD6E",
                    fontFamily: "Times-Roman, serif",
                    fontSize: 22,
                    fontWeight: "bold",
                  }}
                >
                  TA
                </span>
              </div>
            </div>
          </PdfPage>
        )}
      </div>
    );
  },
);

ParchmentPdfDocument.displayName = "ParchmentPdfDocument";
