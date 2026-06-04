import * as brevo from "@getbrevo/brevo";
import { getServerEnv } from "@/lib/env";

export function getBrevoClient() {
  const env = getServerEnv();
  if (!env.BREVO_API_KEY) {
    throw new Error("Missing BREVO_API_KEY");
  }

  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
  return client;
}
