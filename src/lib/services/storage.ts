import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/clients/r2";

export type GeneratedFile = {
  type: "image" | "audio" | "parchemin" | "certificat";
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME");
  return bucket;
}

function keyFor(commandeId: string, type: GeneratedFile["type"], fileName: string): string {
  return `totems/${commandeId}/${type}/${fileName}`;
}

export async function uploadFile(
  commandeId: string,
  file: GeneratedFile,
): Promise<{ url: string; signedUrl: string; key: string }> {
  const client = getR2Client();
  const bucket = getBucket();
  const key = keyFor(commandeId, file.type, file.fileName);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
    }),
  );

  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : `https://${bucket}.r2.cloudflarestorage.com/${key}`;

  const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: 7 * 24 * 60 * 60, // Cloudflare R2 max = 7 jours
  });

  return { url: publicUrl, signedUrl, key };
}

export async function uploadAndDeliver(
  commandeId: string,
  files: GeneratedFile[],
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const file of files) {
    const { url, signedUrl } = await uploadFile(commandeId, file);
    results[file.type] = file.type === "parchemin" || file.type === "certificat" ? signedUrl : url;
  }

  return results;
}
