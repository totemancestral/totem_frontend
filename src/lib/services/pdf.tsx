import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

export type PdfPayload = {
  prenom: string;
  nomAncestral: string;
  archetypeId: string;
  texteParchemin: string;
  numeroCollection: number;
  langue: "fr" | "en";
  imageUrl?: string;
  imageDataUrl?: string;
};

const parchmentBase = "#F0DFA0";
const parchmentLight = "#F4E4A8";
const parchmentMid = "#E8CC80";
const parchmentDark = "#8A4810";
const ink = "#1E0A00";
const gold = "#C9A84C";
const goldLight = "#FFCD6E";
const sealRed = "#A60C06";

const styles = StyleSheet.create({
  page: {
    backgroundColor: parchmentBase,
    padding: 0,
  },
  rod: {
    height: 18,
    backgroundColor: "#8A520D",
    marginHorizontal: 12,
    borderRadius: 9,
    borderBottom: "1px solid #6A3800",
  },
  rodTop: {
    height: 18,
    backgroundColor: "#8A520D",
    marginHorizontal: 12,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderBottom: "1px solid #6A3800",
  },
  rodBottom: {
    height: 18,
    backgroundColor: "#8A520D",
    marginHorizontal: 12,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderTop: "1px solid #6A3800",
  },
  curl: {
    height: 12,
    backgroundColor: "#9A5C10",
    marginHorizontal: 14,
    opacity: 0.4,
  },
  outerWrap: {
    marginHorizontal: 16,
    border: "1px solid #8A4810",
    padding: 4,
  },
  borderWrap: {
    border: "0.5px solid #C9A84C",
    padding: 3,
  },
  body: {
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  line: {
    borderBottom: "0.5px solid #8A4810",
    opacity: 0.15,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    color: ink,
    marginBottom: 2,
    letterSpacing: 3,
    fontWeight: "bold",
  },
  divider: {
    textAlign: "center",
    fontSize: 13,
    color: "#8A520D",
    marginVertical: 6,
    letterSpacing: 5,
  },
  imageWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 320,
    height: 320,
    objectFit: "contain",
  },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#8A520D",
    letterSpacing: 1.5,
    marginBottom: 1,
    marginTop: 6,
  },
  value: {
    fontSize: 11,
    color: ink,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 10.5,
    lineHeight: 1.85,
    textAlign: "justify",
    color: ink,
    marginBottom: 6,
  },
  bodyItalic: {
    fontSize: 10.5,
    lineHeight: 1.85,
    textAlign: "justify",
    color: ink,
    fontStyle: "italic",
    marginBottom: 6,
  },
  sealWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  seal: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #FFCD6E",
  },
  sealInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    border: "0.5px solid rgba(255,205,110,0.5)",
  },
  sealFleur: {
    fontSize: 22,
    color: goldLight,
  },
  sealText: {
    fontSize: 5,
    color: "#F5CD64",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 2,
  },
  signature: {
    textAlign: "right",
    fontSize: 9,
    color: "#8A520D",
    fontStyle: "italic",
    marginTop: 6,
  },
  serieNum: {
    textAlign: "center",
    fontSize: 7,
    color: "#8A520D",
    letterSpacing: 1,
    marginTop: 14,
  },
  fold: {
    borderBottom: "0.5px solid #8A4810",
    opacity: 0.08,
    marginVertical: 10,
    marginHorizontal: 8,
  },

  // Certificate styles
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
    fontSize: 9,
    textAlign: "center",
    color: "#A06418",
    marginBottom: 14,
    fontStyle: "italic",
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
  certSealWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  certSig: {
    textAlign: "right",
    fontSize: 9,
    color: "#8A520D",
    fontStyle: "italic",
    marginTop: 12,
  },
  certImageWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  certImage: {
    width: 200,
    height: 200,
    objectFit: "contain",
  },
});

function WaxSeal() {
  return (
    <View style={styles.sealWrap}>
      <View style={styles.seal}>
        <View style={styles.sealInner}>
          <Text style={styles.sealFleur}>⚜</Text>
        </View>
      </View>
      <Text style={styles.sealText}>· SIGILLUM TOTEM ·</Text>
    </View>
  );
}

function ParcheminDocument({ payload }: { payload: PdfPayload }) {
  const paragraphs = payload.texteParchemin
    .split("\n")
    .filter((p) => p.trim().length > 0);

  const serieNum = String(payload.numeroCollection).padStart(6, "0");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.rodTop} />
        <View style={styles.curl} />

        <View style={styles.outerWrap}>
          <View style={styles.borderWrap}>
            <View style={styles.body}>
              <Text style={styles.title}>TOTEM ANCESTRAL</Text>
              <Text style={styles.divider}>⸻ ✦ ⸻</Text>

              {(payload.imageDataUrl || payload.imageUrl) && (
                <View style={styles.imageWrap}>
                  <Image style={styles.image} src={payload.imageDataUrl || payload.imageUrl!} />
                </View>
              )}

              <View style={styles.line} />

              <Text style={styles.label}>{payload.langue === "fr" ? "Destinataire" : "Recipient"}</Text>
              <Text style={styles.value}>{payload.prenom}</Text>

              <Text style={styles.label}>{payload.langue === "fr" ? "Nom Ancestral" : "Ancestral Name"}</Text>
              <Text style={styles.value}>{payload.nomAncestral}</Text>

              <Text style={styles.label}>{payload.langue === "fr" ? "Collection" : "Collection"}</Text>
              <Text style={styles.value}>{payload.langue === "fr" ? "Tome" : "Volume"} {serieNum}</Text>

              <View style={styles.fold} />
              <View style={styles.line} />

              {paragraphs.map((para, i) => (
                <Text key={i} style={i === 0 ? styles.bodyItalic : styles.bodyText}>
                  {para}
                </Text>
              ))}

              <View style={styles.line} />
              <View style={styles.fold} />

              <WaxSeal />

              <Text style={styles.signature}>✦ SENYCE PARTNERS ✦</Text>

              <Text style={styles.serieNum}>
                {payload.langue === "fr"
                  ? `Certifié authentique — ${payload.nomAncestral} — N° ${serieNum}`
                  : `Certified authentic — ${payload.nomAncestral} — No. ${serieNum}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.curl} />
        <View style={styles.rodBottom} />
      </Page>
    </Document>
  );
}

function CertificatDocument({ payload }: { payload: PdfPayload }) {
  const serieNum = String(payload.numeroCollection).padStart(6, "0");

  const t = payload.langue === "fr"
    ? {
        title: "CERTIFICAT D'AUTHENTICITÉ",
        subtitle: "Œuvre d'art numérique générée par intelligence artificielle",
        line1: `Nous, SENYCE PARTNERS, certifions que l'œuvre intitulée "${payload.nomAncestral}" a été créée exclusivement pour ${payload.prenom} à l'aide de notre pipeline d'intelligence artificielle Totem Ancestral.`,
        line2: "Cette œuvre unique, numérotée et scellée, est le fruit des réponses personnelles fournies par le destinataire lors de son parcours initiatique. Elle intègre des éléments narratifs, visuels et sonores générés sur mesure par nos algorithmes sacrés.",
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
        line2: "This unique, numbered and sealed work is the fruit of the personal responses provided by the recipient during their initiatory journey. It integrates custom-generated narrative, visual and audio elements crafted by our sacred algorithms.",
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
              <View style={styles.certImageWrap}>
                <Image style={styles.certImage} src={payload.imageDataUrl || payload.imageUrl!} />
              </View>
            )}

            <View style={styles.certDivider} />

            <View style={styles.certSealWrap}>
              <View style={styles.seal}>
                <View style={styles.sealInner}>
                  <Text style={styles.sealFleur}>⚜</Text>
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
  const [parcheminBuffer, certificatBuffer] = await Promise.all([
    renderToBuffer(<ParcheminDocument payload={payload} />),
    renderToBuffer(<CertificatDocument payload={payload} />),
  ]);

  return { parcheminBuffer, certificatBuffer };
}
