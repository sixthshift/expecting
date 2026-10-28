// Logging in and out: the only server functions anyone may call without a
// session, since they are how you get one and how you end it. The gate opens
// this file by name (OPEN_FUNCTIONS in src/server/auth/gate.ts), so nothing
// else belongs here.

import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { SessionRepo } from "../db/models/auth/repo";
import { readSessionCookie, SESSION_COOKIE, sessionCookieOptions } from "../server/auth/cookie";
import { auth, clientKey, limiter, safeNext } from "../server/auth/gate";
import { verifyPassword } from "../server/auth/password";
import { getDb } from "../server/core/db";

export type LoginResult = { ok: true; next: string } | { ok: false; error: "wrong" | "locked" };

/** The household password: a session cookie for this browser, and where to go now. */
export const login = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().max(1024), next: z.string().optional() }).strict())
  .handler(async ({ data }): Promise<LoginResult> => {
    const next = safeNext(data.next);
    const mode = auth();
    if (!mode.enabled) return { ok: true, next };

    const request = getRequest();
    const key = clientKey(request);
    if (limiter.locked(key)) return { ok: false, error: "locked" };

    if (!(await verifyPassword(data.password, mode.hash))) {
      limiter.fail(key);
      return { ok: false, error: limiter.locked(key) ? "locked" : "wrong" };
    }

    limiter.succeed(key);
    const sessions = new SessionRepo(getDb());
    sessions.prune();
    setCookie(SESSION_COOKIE, sessions.create(), sessionCookieOptions(request));
    return { ok: true, next };
  });

/** Ends this browser's session. */
export const logout = createServerFn({ method: "POST" }).handler(() => {
  const token = readSessionCookie(getRequest());
  if (token) new SessionRepo(getDb()).end(token);
  deleteCookie(SESSION_COOKIE, { path: "/" });
});
