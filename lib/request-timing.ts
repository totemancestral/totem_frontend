// Provisional budgets agreed for Render 1 CPU / 2 GB and Vercel Hobby + Fluid.
// These are waiting budgets, not measured generation times or cancellation deadlines.
export const REQUEST_TIMING = {
  read: 20_000,
  draw: 25_000,
  paymentWindow: 125_000,
  artworkWindow: 305_000,
  paymentInterval: 4_000,
  artworkInterval: 5_000,
} as const;

export function requestSignal(timeout: number, signal?: AbortSignal) {
  const deadline = AbortSignal.timeout(timeout);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}
