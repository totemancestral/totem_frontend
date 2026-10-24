import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const BYPASS_COOKIE = "totem_bypass";
export const BYPASS_TTL = 8 * 60 * 60;
function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(`totem-maintenance:${value}`).digest();
}
export function matchesMaintenanceKey(key: string, secret: string): boolean {
  return timingSafeEqual(signature(key, secret), signature(secret, secret));
}
export function createMaintenanceToken(secret: string, now = Date.now()): string {
  const payload = `v1.${Math.floor(now / 1000) + BYPASS_TTL}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload, secret).toString("hex")}`;
}
export function verifyMaintenanceToken(token: string | undefined, secret: string | undefined, now = Date.now()): boolean {
  if (!secret || !token) return false;
  const match = /^(v1\.([0-9]{10})\.[a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[2]);
  const seconds = Math.floor(now / 1000);
  return expires > seconds && expires <= seconds + BYPASS_TTL &&
    timingSafeEqual(signature(match[1], secret), Buffer.from(match[3], "hex"));
}
