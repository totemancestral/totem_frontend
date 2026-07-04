import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Capture chaque page du document parchemin (hors écran) et génère un PDF A4
 * portrait, 3 pages max, haute résolution (scale 2).
 */
export async function downloadParchmentPdf(container: HTMLElement, fileName: string) {
  // Charger les polices AVANT la capture pour qu'elles apparaissent dans le PDF.
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  // petite pause pour laisser les images/polices se peindre
  await new Promise((r) => setTimeout(r, 150));

  const pages = Array.from(container.querySelectorAll<HTMLElement>(".pdf-page")).slice(0, 3);

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0a0a0e",
      logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
  }

  pdf.save(fileName);
}
