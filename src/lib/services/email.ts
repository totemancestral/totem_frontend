export type EmailLocale = "fr" | "en";

export async function sendConfirmationEmail(): Promise<void> {
  throw new Error("Brevo confirmation email not implemented yet");
}

export async function sendDeliveryEmail(): Promise<void> {
  throw new Error("Brevo delivery email not implemented yet");
}

export async function sendAdminAlert(): Promise<void> {
  throw new Error("Brevo admin alert not implemented yet");
}
