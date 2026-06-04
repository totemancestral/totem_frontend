export type PdfPayload = {
  prenom: string;
  nomAncestral: string;
  archetypeId: string;
  texteParchemin: string;
  numeroCollection: number;
  langue: "fr" | "en";
};

export async function generatePDFs(_payload: PdfPayload): Promise<{
  parcheminBuffer: Buffer;
  certificatBuffer: Buffer;
}> {
  throw new Error("PDF generation not implemented yet");
}
