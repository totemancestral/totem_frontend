import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { requireEnv } from "./env.mjs";

const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET_NAME = requireEnv("R2_BUCKET_NAME", ["R2_BUCKET"]);

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  // Test 1: List buckets
  console.log("🔍 Testing R2 connection...");
  try {
    const buckets = await client.send(new ListBucketsCommand({}));
    console.log(`✅ Connected! Buckets: ${buckets.Buckets?.map((b) => b.Name).join(", ")}`);
  } catch (err) {
    console.error("❌ ListBuckets failed:", err.message);
    return;
  }

  // Test 2: Check if bucket exists and list objects
  try {
    const objects = await client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 10,
      }),
    );
    console.log(`✅ Bucket "${R2_BUCKET_NAME}" exists. Keys: ${objects.KeyCount ?? 0}`);
    if (objects.Contents?.length) {
      for (const obj of objects.Contents) {
        console.log(`  - ${obj.Key} (${(obj.Size / 1024).toFixed(1)} KB)`);
      }
    }
  } catch (err) {
    console.error(`❌ Bucket "${R2_BUCKET_NAME}" access failed:`, err.message);
  }

  // Test 3: Upload a tiny test file
  try {
    const testKey = "test-connection.txt";
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
        Body: Buffer.from(`R2 connection test - ${new Date().toISOString()}`),
        ContentType: "text/plain",
      }),
    );
    console.log(`✅ Successfully uploaded test file: ${testKey}`);
  } catch (err) {
    console.error("❌ Upload test failed:", err.message);
  }
}

main();
