import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

export type PdfPayload = {
  prenom: string;
  nomAncestral: string;
  archetypeId: string;
  texteParchemin: string;
  numeroCollection: number;
  langue: "fr" | "en";
};

const parchmentBase = "#F0DFA0";
const parchmentDark = "#8A4810";
const parchmentLight = "#E8CC80";
const gold = "#C9A84C";
const goldText = "#8A520D";
const ink = "#1E0A00";
const sealRed = "#A60C06";

const styles = StyleSheet.create({
  parcheminPage: {
    backgroundColor: parchmentBase,
    padding: 0,
  },
  certificatPage: {
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  outerBorder: {
    margin: 18,
    borderWidth: 2,
    borderColor: parchmentDark,
    padding: 6,
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: goldText,
    padding: 4,
  },
  cornerTL: {
    position: "absolute",
    top: -1,
    left: -1,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: gold,
  },
  cornerTR: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: gold,
  },
  cornerBL: {
    position: "absolute",
    bottom: -1,
    left: -1,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: gold,
  },
  cornerBR: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: gold,
  },
  bodyContent: {
    padding: 35,
    backgroundColor: parchmentBase,
  },
  rodTop: {
    height: 14,
    backgroundColor: goldText,
    borderBottomWidth: 2,
    borderBottomColor: "#6A3800",
    marginHorizontal: 8,
    borderRadius: 7,
  },
  rodBottom: {
    height: 14,
    backgroundColor: goldText,
    borderTopWidth: 2,
    borderTopColor: "#6A3800",
    marginHorizontal: 8,
    borderRadius: 7,
  },
  curlTop: {
    height: 10,
    backgroundColor: parchmentDark,
    opacity: 0.3,
    marginHorizontal: 10,
  },
  curlBottom: {
    height: 10,
    backgroundColor: parchmentDark,
    opacity: 0.3,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: ink,
    marginBottom: 6,
    letterSpacing: 2,
  },
  divider: {
    textAlign: "center",
    fontSize: 14,
    color: goldText,
    marginVertical: 8,
    letterSpacing: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: goldText,
    marginBottom: 2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 11,
    color: ink,
    marginBottom: 8,
    fontFamily: "Times-Roman",
  },
  body: {
    fontSize: 11,
    lineHeight: 1.9,
    textAlign: "justify",
    color: ink,
    fontFamily: "Times-Roman",
    marginTop: 6,
  },
  bodyFirst: {
    fontSize: 11,
    lineHeight: 1.9,
    textAlign: "justify",
    color: ink,
    fontFamily: "Times-Roman",
    fontStyle: "italic",
  },
  signature: {
    marginTop: 24,
    textAlign: "right",
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: goldText,
    fontStyle: "italic",
  },
  sealWrap: {
    alignItems: "center",
    marginVertical: 14,
  },
  seal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFCD6E",
  },
  sealInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: sealRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,205,110,0.5)",
  },
  sealText: {
    fontSize: 20,
    color: "#FFCD6E",
  },
  sealRingText: {
    fontSize: 5,
    color: "#F5CD64",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 2,
  },
  numeroSerie: {
    fontSize: 8,
    textAlign: "center",
    color: goldText,
    marginTop: 20,
    fontFamily: "Times-Roman",
    letterSpacing: 1,
  },
  lineRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: goldText,
    opacity: 0.2,
    marginVertical: 6,
  },
  foldLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: goldText,
    opacity: 0.08,
    marginVertical: 12,
    marginHorizontal: 10,
  },

  certBorder: {
    borderWidth: 2,
    borderColor: gold,
    padding: 30,
    marginTop: 10,
  },
  certTitle: {
    fontFamily: "Times-Roman",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: gold,
    marginBottom: 4,
    letterSpacing: 1,
  },
  certSubtitle: {
    fontSize: 10,
    textAlign: "center",
    color: goldText,
    marginBottom: 16,
    fontStyle: "italic",
  },
  certBody: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "justify",
    color: ink,
    fontFamily: "Times-Roman",
  },
  certLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: gold,
    marginBottom: 2,
    marginTop: 8,
    textTransform: "uppercase",
  },
  certValue: {
    fontSize: 10,
    color: ink,
    marginBottom: 4,
    fontFamily: "Times-Roman",
  },
  certSignature: {
    marginTop: 24,
    textAlign: "right",
    fontStyle: "italic",
    fontSize: 10,
    color: goldText,
  },
  certSealWrap: {
    alignItems: "center",
    marginVertical: 12,
  },
});

function ParchmentDivider({ text = "⸻ ✦ ⸻" }: { text?: string }) {
  return <Text style={styles.divider}>{text}</Text>;
}

function WaxSeal() {
  return (
    <View style={styles.sealWrap}>
      <View style={styles.seal}>
        <View style={styles.sealInner}>
          <Text style={styles.sealText}>⚜</Text>
        </View>
      </View>
      <Text style={styles.sealRingText}>· SIGILLUM REGIS ·</Text>
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
      <Page size="A4" style={styles.parcheminPage}>
        <View style={styles.rodTop} />
        <View style={styles.curlTop} />

        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <View style={styles.bodyContent}>
              <Text style={styles.title}>✦ TOTEM ANCESTRAL ✦</Text>
              <ParchmentDivider />

              <Text style={styles.label}>Destinataire</Text>
              <Text style={styles.value}>{payload.prenom}</Text>

              <Text style={styles.label}>Nom Ancestral</Text>
              <Text style={styles.value}>{payload.nomAncestral}</Text>

              <Text style={styles.label}>Collection</Text>
              <Text style={styles.value}>Tome {serieNum}</Text>

              <View style={styles.lineRule} />
              <View style={styles.foldLine} />

              {paragraphs.map((para, i) => (
                <Text key={i} style={i === 0 ? styles.bodyFirst : styles.body}>
                  {para}
                </Text>
              ))}

              <View style={styles.foldLine} />
              <View style={styles.lineRule} />

              <WaxSeal />

              <Text style={styles.signature}>✦ SENYCE PARTNERS ✦</Text>

              <Text style={styles.numeroSerie}>
                Certifié authentique — {payload.nomAncestral} — N° {serieNum}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.curlBottom} />
        <View style={styles.rodBottom} />
      </Page>
    </Document>
  );
}

function CertificatDocument({ payload }: { payload: PdfPayload }) {
  const serieNum = String(payload.numeroCollection).padStart(6, "0");
  const localeText =
    payload.langue === "fr"
      ? {
          title: "CERTIFICAT D'AUTHENTICITÉ",
          subtitle: "Œuvre d'art numérique générée par intelligence artificielle",
          body: `Nous, SENYCE PARTNERS, certifions que l'œuvre intitulée "${payload.nomAncestral}" a été créée exclusivement pour ${payload.prenom} à l'aide de notre pipeline d'intelligence artificielle Totem Ancestral.`,
          detail: "Cette œuvre unique, numérotée et scellée, est le fruit des réponses personnelles fournies par le destinataire lors de son parcours initiatique. Elle intègre des éléments narratifs, visuels et sonores générés sur mesure par nos algorithmes sacrés.",
          date: `Fait à distance du monde, le ${new Date().toLocaleDateString("fr-FR")}`,
          signature: "Pour SENYCE PARTNERS",
        }
      : {
          title: "CERTIFICATE OF AUTHENTICITY",
          subtitle: "Digital artwork generated by artificial intelligence",
          body: `We, SENYCE PARTNERS, certify that the artwork titled "${payload.nomAncestral}" was created exclusively for ${payload.prenom} using our Totem Ancestral artificial intelligence pipeline.`,
          detail: "This unique, numbered and sealed work is the fruit of the personal responses provided by the recipient during their initiatory journey. It integrates custom-generated narrative, visual and audio elements crafted by our sacred algorithms.",
          date: `Done on ${new Date().toLocaleDateString("en-US")}`,
          signature: "For SENYCE PARTNERS",
        };

  return (
    <Document>
      <Page size="A4" style={styles.certificatPage}>
        <View style={styles.certBorder}>
          <Text style={styles.certTitle}>✦ {localeText.title} ✦</Text>
          <Text style={styles.certSubtitle}>{localeText.subtitle}</Text>
          <View style={styles.lineRule} />

          <View style={styles.certSealWrap}>
            <View style={styles.seal}>
              <View style={styles.sealInner}>
                <Text style={styles.sealText}>⚜</Text>
              </View>
            </View>
          </View>

          <Text style={styles.certBody}>{localeText.body}</Text>
          <Text style={{ ...styles.certBody, marginTop: 8 }}>{localeText.detail}</Text>

          <View style={styles.lineRule} />

          <Text style={styles.certLabel}>{payload.langue === "fr" ? "Œuvre" : "Artwork"}</Text>
          <Text style={styles.certValue}>{payload.nomAncestral}</Text>

          <Text style={styles.certLabel}>{payload.langue === "fr" ? "Numéro de série" : "Serial Number"}</Text>
          <Text style={styles.certValue}>{serieNum}</Text>

          <Text style={styles.certLabel}>{payload.langue === "fr" ? "Propriétaire" : "Owner"}</Text>
          <Text style={styles.certValue}>{payload.prenom}</Text>

          <Text style={styles.certLabel}>{payload.langue === "fr" ? "Date" : "Date"}</Text>
          <Text style={styles.certValue}>{localeText.date}</Text>

          <View style={styles.lineRule} />
          <Text style={styles.certSignature}>{localeText.signature}</Text>
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
