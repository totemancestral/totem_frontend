import { S3Client } from "@aws-sdk/client-s3";
import { getServerEnv } from "@/lib/env";

export function getR2Client() {
  const env = getServerEnv();
  const required = [env.R2_ACCOUNT_ID, env.R2_ACCESS_KEY_ID, env.R2_SECRET_ACCESS_KEY];
  if (required.some((value) => !value)) {
    throw new Error("Missing Cloudflare R2 credentials");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
}
