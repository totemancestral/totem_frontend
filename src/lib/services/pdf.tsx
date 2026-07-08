import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer, Font } from "@react-pdf/renderer";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { StorySection } from "@/lib/totem-v3";

const dancingScriptPath = join(process.cwd(), "public/fonts/totem/DancingScript-Regular.ttf");

Font.register({
  family: "DancingScript",
  fonts: [
    { src: dancingScriptPath, fontWeight: 400, fontStyle: "normal" },
    { src: dancingScriptPath, fontWeight: 400, fontStyle: "italic" },
    { src: dancingScriptPath, fontWeight: 700, fontStyle: "normal" },
    { src: dancingScriptPath, fontWeight: 700, fontStyle: "italic" },
  ],
});

export type PdfPayload = {
  prenom: string;
  nomAncestral: string;
  archetypeId: string;
  texteParchemin: string;
  numeroCollection: number;
  langue: "fr" | "en";
  imageUrl?: string;
  imageDataUrl?: string;
  sections?: StorySection[];
  subtitle?: string;
  parchmentBackgroundDataUrl?: string;
};

const bgDark = "#0d0d12";
const bgInner = "#f5efe0";
const gold = "#C9A84C";
const goldLight = "#FFCD6E";
const goldDark = "#8A6A2B";
const ink = "#2c1d0c";
const inkLight = "#5a4526";
const sealRed = "#9e1b13";

const styles = StyleSheet.create({
  page: {
    backgroundColor: bgDark,
    padding: 0,
  },
  outerFrame: {
    margin: 16,
    border: "2px solid #C9A84C",
    flex: 1,
  },
  parchmentArea: {
    margin: 10,
    backgroundColor: bgInner,
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  parchmentBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "fill",
  },
  parchmentContent: {
    position: "relative",
    flex: 1,
    paddingTop: 66,
    paddingBottom: 62,
    paddingHorizontal: 70,
  },
  coverTop: {
    alignItems: "center",
    marginTop: 12,
  },
  coverTitle: {
    fontFamily: "DancingScript",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 4,
    color: ink,
    textAlign: "center",
  },
  coverSubtitle: {
    fontFamily: "DancingScript",
    fontSize: 13,
    color: inkLight,
    textAlign: "center",
    marginTop: 4,
  },
  goldRule: {
    width: 100,
    height: 2,
    backgroundColor: gold,
    marginVertical: 12,
    alignSelf: "center",
  },
  coverImageWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  coverImage: {
    width: 260,
    height: 260,
    objectFit: "contain",
  },
  coverTotemName: {
    fontFamily: "DancingScript",
    fontSize: 22,
    fontWeight: "bold",
    color: ink,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  coverFor: {
    fontFamily: "DancingScript",
    fontSize: 16,
    color: inkLight,
    textAlign: "center",
    marginTop: 6,
  },
  coverSealWrap: {
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 8,
  },
  storyHeader: {
    fontFamily: "DancingScript",
    fontSize: 24,
    fontWeight: "bold",
    color: ink,
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  storySectionTitle: {
    fontFamily: "DancingScript",
    fontSize: 18,
    fontWeight: "bold",
    color: inkLight,
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 1,
  },
  storyParagraph: {
    fontFamily: "DancingScript",
    fontSize: 11,
    lineHeight: 1.7,
    textAlign: "justify",
    color: ink,
    marginBottom: 8,
  },
  signature: {
    fontFamily: "Times-Italic",
    textAlign: "right",
    fontSize: 9,
    color: inkLight,
    marginTop: 8,
  },
  serieNum: {
    textAlign: "center",
    fontSize: 7,
    color: inkLight,
    letterSpacing: 1,
    marginTop: 6,
  },
  sealWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  seal: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #FFCD6E",
  },
  sealInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    border: "0.5px solid rgba(255,205,110,0.5)",
  },
  sealText: {
    fontFamily: "DancingScript",
    fontSize: 22,
    color: goldLight,
    fontWeight: "bold",
  },
  sealLabel: {
    fontSize: 6,
    color: goldLight,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 2,
  },
  certPage: {
    backgroundColor: "#FFFDF5",
    padding: 0,
  },
  certBorder: {
    margin: 16,
    border: "1.5px solid #C9A84C",
    padding: 24,
  },
  certInner: {
    border: "0.5px solid #8A520D",
    padding: 20,
    flex: 1,
  },
  certTitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#8A520D",
    letterSpacing: 2,
    fontWeight: "bold",
    marginBottom: 2,
  },
  certSubtitle: {
    fontFamily: "Times-Italic",
    fontSize: 9,
    textAlign: "center",
    color: "#A06418",
    marginBottom: 14,
  },
  certBody: {
    fontSize: 10,
    lineHeight: 1.7,
    textAlign: "justify",
    color: ink,
    marginBottom: 6,
  },
  certDivider: {
    borderBottom: "0.5px solid #C9A84C",
    opacity: 0.3,
    marginVertical: 10,
  },
  certRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  certLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#8A520D",
    letterSpacing: 1,
    width: 90,
  },
  certValue: {
    fontSize: 10,
    color: ink,
    flex: 1,
  },
  certSig: {
    fontFamily: "Times-Italic",
    textAlign: "right",
    fontSize: 9,
    color: "#8A520D",
    marginTop: 12,
  },
});

function buildSections(text: string): StorySection[] {
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);
  if (paragraphs.length <= 2) {
    return [{ title: "", paragraphs }];
  }
  const mid = Math.ceil(paragraphs.length / 2);
  return [
    { title: "", paragraphs: paragraphs.slice(0, mid) },
    { title: "", paragraphs: paragraphs.slice(mid) },
  ];
}

function GoldRule() {
  return <View style={styles.goldRule} />;
}

function ParchmentSurface({
  payload,
  children,
}: {
  payload: PdfPayload;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.parchmentArea}>
      {payload.parchmentBackgroundDataUrl ? (
        <Image style={styles.parchmentBackground} src={payload.parchmentBackgroundDataUrl} />
      ) : null}
      <View style={styles.parchmentContent}>{children}</View>
    </View>
  );
}

function SectionBlock({ section }: { section: StorySection }) {
  return (
    <View wrap={false} style={{ marginBottom: 16 }}>
      {section.title ? <Text style={styles.storySectionTitle}>{section.title}</Text> : null}
      {section.paragraphs.map((p, i) => {
        const key = `p-${i}`;
        return (
          <Text key={key} style={styles.storyParagraph}>
            {p}
          </Text>
        );
      })}
    </View>
  );
}

function WaxSeal() {
  return (
    <View style={styles.sealWrap}>
      <View style={styles.seal}>
        <View style={styles.sealInner}>
          <Text style={styles.sealText}>TA</Text>
        </View>
      </View>
      <Text style={styles.sealLabel}>· SIGILLUM TOTEM ·</Text>
    </View>
  );
}

function ParcheminDocument({ payload }: { payload: PdfPayload }) {
  const sections: StorySection[] =
    payload.sections && payload.sections.length > 0
      ? payload.sections
      : buildSections(payload.texteParchemin);

  const serieNum = String(payload.numeroCollection).padStart(6, "0");
  const subtitle =
    payload.subtitle ||
    (payload.langue === "fr"
      ? "Décret royal de révélation symbolique"
      : "Royal decree of symbolic revelation");

  const hasImage = !!(payload.imageDataUrl || payload.imageUrl);
  const imageSrc = payload.imageDataUrl || payload.imageUrl || "";

  function renderStoryPages() {
    if (sections.length === 0) return null;

    const half = Math.ceil(sections.length / 2);
    const page2 = sections.slice(0, half);
    const page3 = sections.slice(half);

    const pageContent = (secs: StorySection[]) => (
      <ParchmentSurface payload={payload}>
        {secs.map((s, i) => (
          <SectionBlock key={s.title || i} section={s} />
        ))}
        <View style={{ flex: 1 }} />
        <WaxSeal />
        <Text style={styles.signature}>✦ SENYCE PARTNERS ✦</Text>
        <Text style={styles.serieNum}>
          {payload.langue === "fr"
            ? `Certifié authentique — ${payload.nomAncestral} — N° ${serieNum}`
            : `Certified authentic — ${payload.nomAncestral} — No. ${serieNum}`}
        </Text>
      </ParchmentSurface>
    );

    return (
      <>
        <Page size="A4" style={styles.page}>
          <View style={styles.outerFrame}>{pageContent(page2)}</View>
        </Page>
        {page3.length > 0 && (
          <Page size="A4" style={styles.page}>
            <View style={styles.outerFrame}>{pageContent(page3)}</View>
          </Page>
        )}
      </>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerFrame}>
          <ParchmentSurface payload={payload}>
            <View style={styles.coverTop}>
              <Text style={styles.coverTitle}>TOTEM ANCESTRAL</Text>
              <Text style={styles.coverSubtitle}>{subtitle}</Text>
              <GoldRule />
            </View>

            {hasImage && (
              <View style={styles.coverImageWrap}>
                <Image style={styles.coverImage} src={imageSrc} />
              </View>
            )}

            <Text style={styles.coverTotemName}>{payload.nomAncestral}</Text>

            <Text style={styles.coverFor}>
              {payload.langue === "fr" ? "Préparé pour" : "Prepared for"} {payload.prenom}
            </Text>

            <View style={{ flex: 1 }} />

            <View style={styles.coverSealWrap}>
              <WaxSeal />
            </View>
          </ParchmentSurface>
        </View>
      </Page>

      {renderStoryPages()}
    </Document>
  );
}

function CertificatDocument({ payload }: { payload: PdfPayload }) {
  const serieNum = String(payload.numeroCollection).padStart(6, "0");

  const t =
    payload.langue === "fr"
      ? {
          title: "CERTIFICAT D'AUTHENTICITÉ",
          subtitle: "Œuvre d'art numérique générée par intelligence artificielle",
          line1: `Nous, SENYCE PARTNERS, certifions que l'œuvre intitulée "${payload.nomAncestral}" a été créée exclusivement pour ${payload.prenom} à l'aide de notre pipeline d'intelligence artificielle Totem Ancestral.`,
          line2:
            "Cette œuvre unique, numérotée et scellée, est le fruit des réponses personnelles fournies par le destinataire lors de son parcours initiatique. Elle intègre des éléments narratifs, visuels et sonores générés sur mesure par nos algorithmes sacrés.",
          date: `Fait à distance du monde, le ${new Date().toLocaleDateString("fr-FR")}`,
          sig: "Pour SENYCE PARTNERS",
          artwork: "Œuvre",
          serial: "Numéro de série",
          owner: "Propriétaire",
          dateLabel: "Date",
        }
      : {
          title: "CERTIFICATE OF AUTHENTICITY",
          subtitle: "Digital artwork generated by artificial intelligence",
          line1: `We, SENYCE PARTNERS, certify that the artwork titled "${payload.nomAncestral}" was created exclusively for ${payload.prenom} using our Totem Ancestral artificial intelligence pipeline.`,
          line2:
            "This unique, numbered and sealed work is the fruit of the personal responses provided by the recipient during their initiatory journey. It integrates custom-generated narrative, visual and audio elements crafted by our sacred algorithms.",
          date: `Done on ${new Date().toLocaleDateString("en-US")}`,
          sig: "For SENYCE PARTNERS",
          artwork: "Artwork",
          serial: "Serial Number",
          owner: "Owner",
          dateLabel: "Date",
        };

  return (
    <Document>
      <Page size="A4" style={styles.certPage}>
        <View style={styles.certBorder}>
          <View style={styles.certInner}>
            <Text style={styles.certTitle}>✦ {t.title} ✦</Text>
            <Text style={styles.certSubtitle}>{t.subtitle}</Text>

            {(payload.imageDataUrl || payload.imageUrl) && (
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Image
                  style={{ width: 180, height: 180, objectFit: "contain" }}
                  src={payload.imageDataUrl || payload.imageUrl!}
                />
              </View>
            )}

            <View style={styles.certDivider} />

            <View style={styles.sealWrap}>
              <View style={styles.seal}>
                <View style={styles.sealInner}>
                  <Text style={styles.sealText}>TA</Text>
                </View>
              </View>
            </View>

            <Text style={styles.certBody}>{t.line1}</Text>
            <Text style={{ ...styles.certBody, marginTop: 6 }}>{t.line2}</Text>

            <View style={styles.certDivider} />

            <View style={styles.certRow}>
              <Text style={styles.certLabel}>{t.artwork}</Text>
              <Text style={styles.certValue}>{payload.nomAncestral}</Text>
            </View>
            <View style={styles.certRow}>
              <Text style={styles.certLabel}>{t.serial}</Text>
              <Text style={styles.certValue}>{serieNum}</Text>
            </View>
            <View style={styles.certRow}>
              <Text style={styles.certLabel}>{t.owner}</Text>
              <Text style={styles.certValue}>{payload.prenom}</Text>
            </View>
            <View style={styles.certRow}>
              <Text style={styles.certLabel}>{t.dateLabel}</Text>
              <Text style={styles.certValue}>{t.date}</Text>
            </View>

            <View style={styles.certDivider} />
            <Text style={styles.certSig}>{t.sig}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePDFs(payload: PdfPayload): Promise<{
  parcheminBuffer: Buffer;
  certificatBuffer: Buffer;
}> {
  const payloadWithBackground = {
    ...payload,
    parchmentBackgroundDataUrl:
      payload.parchmentBackgroundDataUrl ?? (await loadParchmentBackgroundDataUrl()),
  };

  const [parcheminBuffer, certificatBuffer] = await Promise.all([
    renderToBuffer(<ParcheminDocument payload={payloadWithBackground} />),
    renderToBuffer(<CertificatDocument payload={payloadWithBackground} />),
  ]);

  return { parcheminBuffer, certificatBuffer };
}

let parchmentBackgroundCache: string | null = null;

async function loadParchmentBackgroundDataUrl(): Promise<string | undefined> {
  if (parchmentBackgroundCache) return parchmentBackgroundCache;

  const candidates = [
    join(process.cwd(), "totem-parchemin/assets/parchemin_ouvert.png"),
    join(process.cwd(), "totem-parchemin/assets/parchemin_ouvert.webp"),
  ];

  for (const candidate of candidates) {
    try {
      const bytes = await readFile(candidate);
      const mime = candidate.endsWith(".webp") ? "image/webp" : "image/png";
      parchmentBackgroundCache = `data:${mime};base64,${bytes.toString("base64")}`;
      return parchmentBackgroundCache;
    } catch {
      // Continue with the next asset candidate, then fall back to flat parchment color.
    }
  }

  return undefined;
}
