import * as brevo from "@getbrevo/brevo";
import { readEnvValue } from "@/lib/env-values";

export function getBrevoClient() {
  const apiKey = readEnvValue("BREVO_API_KEY");
  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY");
  }

  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return client;
}
