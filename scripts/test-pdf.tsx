/**
 * DEPRECATED — PDF expérimental @react-pdf/renderer. Le PDF livré est généré
 * par le backend (pdf-lib). Ne pas lancer. Le CI ne l'exécute pas.
 */
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync } from "fs";

const styles = StyleSheet.create({
  page: { backgroundColor: "#F0DFA0", padding: 20 },
  image: { width: 300, height: 300, objectFit: "contain", alignSelf: "center", marginVertical: 10 },
  title: { fontSize: 18, textAlign: "center", marginBottom: 10, color: "#1E0A00" },
  text: { fontSize: 11, lineHeight: 1.8, textAlign: "justify", color: "#1E0A00" },
});

const imgUrl =
  "https://totem-ancestral.r2.cloudflarestorage.com/totems/2e7a681b-d721-4149-8314-80ab795fbdd6/image/image_2e7a681b-d721-4149-8314-80ab795fbdd6.png";

function TestDoc() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>✦ TOTEM ANCESTRAL ✦</Text>
        <Image style={styles.image} src={imgUrl} />
        <Text style={styles.text}>
          Ceci est un test d'intégration d'image dans le PDF généré par React-PDF. L'image ci-dessus
          provient de Cloudflare R2.
        </Text>
      </Page>
    </Document>
  );
}

async function main() {
  console.log("Generating test PDF with image...");
  const buffer = await renderToBuffer(<TestDoc />);
  writeFileSync("/tmp/test-parchemin.pdf", buffer);
  console.log(`✅ PDF generated: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log("File: /tmp/test-parchemin.pdf");
}

main().catch(console.error);
