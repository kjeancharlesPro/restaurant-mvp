import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function getExpectedAdminCookieValue(): string {
  const pwd = process.env.ADMIN_PASSWORD ?? "restaurant";
  const secret =
    process.env.ADMIN_COOKIE_SECRET ?? "restaurant-mvp-admin-dev-secret";
  return createHmac("sha256", secret).update(pwd, "utf8").digest("hex");
}

export function verifyAdminSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const expected = getExpectedAdminCookieValue();
  try {
    const a = Buffer.from(value, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "restaurant";
  try {
    const a = Buffer.from(candidate, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
