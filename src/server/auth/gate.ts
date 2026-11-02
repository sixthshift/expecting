// Who may in: a request with a live session cookie, which says which of you
// it is. Everything else is sent to log in, or, before anyone is here, to set
// Expecting up (the same page, /login). EXPECTING_LOGIN=off stops asking for
// passwords, not who you are: logging in is tapping your name, and the rule is
// the same.
//
// Two checks share the rule. Pages and /api/* are judged by path, in request
// middleware. A server function's path is a generated id, so it is judged by
// the file it is defined in, in function middleware: every function needs a
// session except those in OPEN_FUNCTIONS, which are how you get one.
//
// An MCP client (src/api/rest/mcp.ts) has no cookie: /api/mcp is judged by its
// bearer token instead (`grantOf`), and the OAuth endpoints it gets one from
// are open. The token is got at /connect, a page like any other, so it is the
// password that lets a client in.

import { SessionRepo } from "../../db/models/auth/repo";
import { ConnectionsRepo, type Grant } from "../../db/models/connections/repo";
import { MCP_PATH } from "../../lib/connect";
import { getDb } from "../core/db";
import { readSessionCookie } from "./cookie";
import { LoginLimiter, loginRequired } from "./password";

let required: boolean | undefined;

/** Whether logins are on, read from the environment once. Throws on a value that is neither on nor off. */
export function loginOn(): boolean {
  if (required === undefined) {
    required = loginRequired();
    if (!required) console.warn("expecting: EXPECTING_LOGIN=off, so anyone who reaches it gets in without a password.");
  }
  return required;
}

export const limiter = new LoginLimiter();

/** Paths anyone may reach: the login page, joining and resetting by a code, the health check, and how an MCP client gets a token (src/server/oauth/endpoints.ts). */
const OPEN = new Set([
  "/login",
  "/join",
  "/reset",
  "/api/health",
  "/.well-known/oauth-protected-resource",
  `/.well-known/oauth-protected-resource${MCP_PATH}`,
  "/.well-known/oauth-authorization-server",
  "/api/oauth/register",
  "/api/oauth/token",
  "/api/oauth/revoke",
]);

/** Where Start serves server functions. Those requests are judged by `refuseFunction`. */
const SERVER_FN_BASE = process.env.TSS_SERVER_FN_BASE ?? "/api/rpc/";

/** Files whose server functions anyone may call: setting up, logging in and out, joining and resetting by a code. Relative to the project root. */
const OPEN_FUNCTIONS = new Set(["src/api/rpc/session.ts"]);

export function isOpenPath(pathname: string): boolean {
  return OPEN.has(pathname);
}

export function isOpenFunction(filename: string): boolean {
  return OPEN_FUNCTIONS.has(filename);
}

/** Each request's session, looked up once: the gate and the functions it lets through both ask. */
const sessions = new WeakMap<Request, string | null>();

/** Which of you `request` is logged in as, by its session cookie; null without a live session. */
export function sessionOf(request: Request): string | null {
  const known = sessions.get(request);
  if (known !== undefined) return known;
  const token = readSessionCookie(request);
  const person = token === null ? null : new SessionRepo(getDb()).check(token);
  sessions.set(request, person);
  return person;
}

export function hasSession(request: Request): boolean {
  return sessionOf(request) !== null;
}

function unauthorised(): Response {
  return Response.json({ error: "Log in first" }, { status: 401 });
}

/**
 * Null to let the request through; otherwise the response that turns it away.
 * A page load is redirected to /login (remembering where it was going), and
 * an API call gets a bare 401. Server functions pass on to `refuseFunction`,
 * and /api/mcp to its handler, which asks `grantOf`.
 */
export function gate(request: Request): Response | null {
  const url = new URL(request.url);
  if (isBuildShell(request)) return null;
  if (url.pathname.startsWith(SERVER_FN_BASE) || url.pathname === MCP_PATH || isOpenPath(url.pathname) || hasSession(request)) return null;
  const wantsPage = request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (wantsPage) {
    const next = url.pathname + url.search;
    return Response.redirect(new URL(`/login${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`, url), 302);
  }
  return unauthorised();
}

/**
 * Whether `request` is the build asking for the shell. SPA mode always prerenders one (Start's schema forces it), and
 * turned away it fails the build's log with a 401. TSS_PRERENDERING is set only inside `vite build`, never where the
 * server runs, and the shell is the empty document /login already serves to anyone.
 */
function isBuildShell(request: Request): boolean {
  return process.env.TSS_PRERENDERING === "true" && request.headers.get("X-TSS_SHELL") === "true";
}

/** Null to let a call to a server function defined in `filename` through; otherwise a 401. */
export function refuseFunction(request: Request, filename: string): Response | null {
  return isOpenFunction(filename) || hasSession(request) ? null : unauthorised();
}

/** Who an MCP request speaks for, by its bearer token; null without a live one. Logins off or on, a client needs one. */
export function grantOf(request: Request): Grant | null {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  return token ? new ConnectionsRepo(getDb()).check(token) : null;
}

/** The client a failed login, or a wrong code, counts against: the proxy's view of it if there is one. */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "direct";
}
