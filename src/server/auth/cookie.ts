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
export function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

/** How the session cookie is set: for the whole site, out of scripts' reach, for as long as a session lives. */
export function sessionCookieOptions(request: Request) {
  return { path: "/", httpOnly: true, sameSite: "lax", secure: isHttps(request), maxAge: SESSION_DAYS * 86_400 } as const;
}
