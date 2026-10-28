// Who may in: a request with a live session cookie, or any request when the
// dev server runs without a password. Everything else is sent to log in.
//
// Two checks share the rule. Pages and /api/* are judged by path, in request
// middleware. A server function's path is a generated id, so it is judged by
// the file it is defined in, in function middleware: every function needs a
// session except those in OPEN_FUNCTIONS, which are how you get one.

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

/** Paths anyone may reach: the login page and the health check. */
const OPEN = new Set(["/login", "/api/health"]);

/** Where Start serves server functions. Those requests are judged by `refuseFunction`. */
const SERVER_FN_BASE = process.env.TSS_SERVER_FN_BASE ?? "/_serverFn/";

/** Files whose server functions anyone may call: logging in and out. Relative to the project root. */
const OPEN_FUNCTIONS = new Set(["src/rpc/session.ts"]);

export function isOpenPath(pathname: string): boolean {
  return OPEN.has(pathname);
}

export function isOpenFunction(filename: string): boolean {
  return OPEN_FUNCTIONS.has(filename);
}

export function hasSession(request: Request): boolean {
  if (!auth().enabled) return true;
  const token = readSessionCookie(request);
  return token !== null && new SessionRepo(getDb()).check(token);
}

function unauthorised(): Response {
  return Response.json({ error: "Log in first" }, { status: 401 });
}

/**
 * Null to let the request through; otherwise the response that turns it away.
 * A page load is redirected to /login (remembering where it was going), and
 * an API call gets a bare 401. Server functions pass on to `refuseFunction`.
 */
export function gate(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname.startsWith(SERVER_FN_BASE) || isOpenPath(url.pathname) || hasSession(request)) return null;
  const wantsPage = request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (wantsPage) {
    const next = url.pathname + url.search;
    return Response.redirect(new URL(`/login${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`, url), 302);
  }
  return unauthorised();
}

/** Null to let a call to a server function defined in `filename` through; otherwise a 401. */
export function refuseFunction(request: Request, filename: string): Response | null {
  return isOpenFunction(filename) || hasSession(request) ? null : unauthorised();
}

/** The client a failed login counts against: the proxy's view of it if there is one. */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "direct";
}

/** Where to go after logging in: a same-site path, never another origin. */
export function safeNext(next: string | null | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
