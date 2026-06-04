export type PipelineStep = "texte" | "image" | "audio" | "pdf" | "upload" | "email";

export type RetryOptions = {
  retries: number;
  delays: number[];
  etape: PipelineStep;
  commandeId: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.retries) {
        throw error;
      }
      await sleep(options.delays[attempt] ?? 1000);
    }
  }

  throw new Error(`Pipeline step ${options.etape} failed for ${options.commandeId}`);
}

export async function generateCoffret(commandeId: string): Promise<void> {
  // M4 will be connected after M3 creates real commandes from Stripe webhooks.
  throw new Error(`Pipeline not implemented yet for commande ${commandeId}`);
}
