export type GeneratedFile = {
  type: "image" | "audio" | "parchemin" | "certificat";
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

export async function uploadAndDeliver(): Promise<void> {
  // M5 placeholder: R2 upload, signed URLs, Supabase update and Brevo delivery.
  throw new Error("Storage and delivery service not implemented yet");
}
