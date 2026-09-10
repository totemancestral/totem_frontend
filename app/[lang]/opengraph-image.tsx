import { ImageResponse } from "next/og";
import { getDictionary, hasLocale } from "./dictionaries";

export const alt = "Totem Ancestral";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "fr";
  const dict = await getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D1A",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "1px solid #B08A3E",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 10,
              color: "#B08A3E",
              textTransform: "uppercase",
            }}
          >
            {dict.hero.tagLabel} · {dict.hero.tagCaption}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              letterSpacing: 6,
              color: "#F3EDDD",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {dict.seo.siteName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#948C78",
              maxWidth: "780px",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            {dict.hero.leadIn}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
