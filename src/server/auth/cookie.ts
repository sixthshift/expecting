import { SESSION_DAYS } from "../../db/models/auth/repo";

export const SESSION_COOKIE = "expecting_session";

/** The session token from a request's Cookie header, if any. */
export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Secure only when the browser reached us over HTTPS, directly or through the proxy. */
function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

export function sessionCookie(token: string, request: Request): string {
  const attrs = [`${SESSION_COOKIE}=${encodeURIComponent(token)}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${SESSION_DAYS * 86_400}`];
  if (isHttps(request)) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
