// Who may in: a request with a live session cookie, or any request when the
// dev server runs without a password. Everything else is sent to log in.

import { SessionRepo } from "../../db/models/auth/repo";
import { getDb } from "../core/db";
import { readSessionCookie } from "./cookie";
import { type AuthMode, authMode, LoginLimiter } from "./password";

let mode: AuthMode | undefined;

/** The auth mode, read from the environment once. Throws in production without a hash. */
export function auth(): AuthMode {
  if (!mode) {
    mode = authMode();
    if (!mode.enabled) console.warn("expecting: EXPECTING_PASSWORD_HASH is not set, so the dev server needs no login.");
  }
  return mode;
}

export const limiter = new LoginLimiter();

/** Paths anyone may reach: the login page, logging in and out, and the health check. */
const OPEN = new Set(["/login", "/api/login", "/api/logout", "/api/health"]);

export function isOpenPath(pathname: string): boolean {
  return OPEN.has(pathname);
}

export function hasSession(request: Request): boolean {
  if (!auth().enabled) return true;
  const token = readSessionCookie(request);
  return token !== null && new SessionRepo(getDb()).check(token);
}

/**
 * Null to let the request through; otherwise the response that turns it away.
 * A page load is redirected to /login (remembering where it was going), and
 * anything else — a server function, an API call — gets a bare 401.
 */
export function gate(request: Request): Response | null {
  const url = new URL(request.url);
  if (isOpenPath(url.pathname) || hasSession(request)) return null;
  const wantsPage = request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (wantsPage) {
    const next = url.pathname + url.search;
    return Response.redirect(new URL(`/login${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`, url), 302);
  }
  return Response.json({ error: "Log in first" }, { status: 401 });
}

/** Where to go after logging in: a same-site path, never another origin. */
export function safeNext(next: string | null | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
