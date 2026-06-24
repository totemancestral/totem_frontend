import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync, readFileSync } from "fs";

// Use the already-uploaded R2 image but fetch it with auth via the SDK
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { requireEnv } from "./env.mjs";

const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET = requireEnv("R2_BUCKET_NAME", ["R2_BUCKET"]);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function getImageAsDataUrl(key: string): Promise<string> {
  const resp = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const body = await resp.Body!.transformToByteArray();
  const b64 = Buffer.from(body).toString("base64");
  return `data:image/png;base64,${b64}`;
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F0DFA0", padding: 20 },
  img: { width: "80%", height: 280, alignSelf: "center", marginVertical: 10, objectFit: "contain" },
  title: {
    fontSize: 18,
    textAlign: "center",
    color: "#1E0A00",
    marginBottom: 4,
    fontWeight: "bold",
  },
  div: { textAlign: "center", fontSize: 13, color: "#8A520D", marginVertical: 6 },
  text: { fontSize: 11, lineHeight: 1.9, textAlign: "justify", color: "#1E0A00", marginBottom: 6 },
  rod: { height: 16, backgroundColor: "#8A520D", marginHorizontal: 10, borderRadius: 8 },
  seal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#A60C06",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    border: "2 solid #FFCD6E",
    marginTop: 8,
  },
  fleur: { fontSize: 20, color: "#FFCD6E" },
});

function Parchemin({ imageSrc }: { imageSrc: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.rod} />
        <Text style={styles.title}>✦ TOTEM ANCESTRAL ✦</Text>
        <Text style={styles.div}>⸻ ✦ ⸻</Text>
        <Image style={styles.img} src={imageSrc} />
        <Text style={styles.text}>
          Par la volonté des ancêtres, toi que l&apos;on nomme N. E. RONALD BILL, fils des terres
          rouges et des rivières lointaines, ce parchemin est le témoignage de ton archétype
          ancestral : le Guerrier.
        </Text>
        <Text style={styles.text}>
          Le feu qui brûle en toi est la flamme des anciens. Ta lignée s&apos;étend sur sept
          générations de protecteurs et de bâtisseurs.
        </Text>
        <View style={styles.seal}>
          <Text style={styles.fleur}>⚜</Text>
        </View>
        <Text
          style={{
            textAlign: "right",
            fontSize: 9,
            color: "#8A520D",
            fontStyle: "italic",
            marginTop: 10,
          }}
        >
          ✦ SENYCE PARTNERS ✦
        </Text>
        <View style={[styles.rod, { marginTop: 10 }]} />
      </Page>
    </Document>
  );
}

async function main() {
  console.log("Fetching image from R2 with auth...");
  const dataUrl = await getImageAsDataUrl(
    "totems/2e7a681b-d721-4149-8314-80ab795fbdd6/image/image_2e7a681b-d721-4149-8314-80ab795fbdd6.png",
  );
  console.log("Image fetched, data URL length: " + dataUrl.length + " chars");

  console.log("Generating PDF...");
  const buffer = await renderToBuffer(<Parchemin imageSrc={dataUrl} />);
  writeFileSync("/tmp/parchemin-test.pdf", buffer);
  console.log(
    "✅ PDF saved: /tmp/parchemin-test.pdf (" + (buffer.length / 1024).toFixed(1) + " KB)",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
