import { createRoute } from "@tanstack/react-router";
import { SessionRepo } from "../../db/models/auth/repo";
import { clearedSessionCookie, readSessionCookie, sessionCookie } from "../../server/auth/cookie";
import { auth, limiter, safeNext } from "../../server/auth/gate";
import { verifyPassword } from "../../server/auth/password";
import { getDb } from "../../server/core/db";
import { Route as rootRoute } from "../root";

/** The client a failed attempt counts against: the proxy's view of it if there is one. */
function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "direct";
}

function seeOther(location: string, request: Request, cookie?: string): Response {
  const headers = new Headers({ location: new URL(location, request.url).toString() });
  if (cookie) headers.set("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

/**
 * POST /api/login — the login form posts here, as a plain form so it works
 * before any script loads. A server route rather than a server function
 * because it runs before there is a session, and sets the cookie itself.
 */
export async function handleLogin(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => new FormData());
  const next = safeNext(form.get("next")?.toString());
  const back = (error: string) => seeOther(`/login?error=${error}${next === "/" ? "" : `&next=${encodeURIComponent(next)}`}`, request);

  const mode = auth();
  if (!mode.enabled) return seeOther(next, request);

  const key = clientKey(request);
  if (limiter.locked(key)) return back("locked");

  const password = form.get("password")?.toString() ?? "";
  if (!(await verifyPassword(password, mode.hash))) {
    limiter.fail(key);
    return back(limiter.locked(key) ? "locked" : "wrong");
  }

  limiter.succeed(key);
  const sessions = new SessionRepo(getDb());
  sessions.prune();
  return seeOther(next, request, sessionCookie(sessions.create(), request));
}

/** POST /api/logout — ends this browser's session. */
export function handleLogout(request: Request): Response {
  const token = readSessionCookie(request);
  if (token) new SessionRepo(getDb()).end(token);
  return seeOther("/login", request, clearedSessionCookie());
}

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/login",
  server: { handlers: { POST: ({ request }) => handleLogin(request) } },
});

export const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/logout",
  server: { handlers: { POST: ({ request }) => handleLogout(request) } },
});
