// Choosing the password, logging in and out: the only server functions anyone
// may call without a session, since they are how you get one and how you end
// it. The gate opens this file by name (OPEN_FUNCTIONS in
// src/server/auth/gate.ts), so nothing else belongs here.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { PasswordRepo, SessionRepo } from "../../db/models/auth/repo";
import { readSessionCookie, SESSION_COOKIE, sessionCookieOptions } from "../../server/auth/cookie";
import { clientKey, limiter, loginOn, safeNext } from "../../server/auth/gate";
import { hashPassword, verifyPassword } from "../../server/auth/password";
import { getDb } from "../../server/core/db";

/** The shortest password allowed. */
export const MIN_PASSWORD = 8;

export type LoginResult = { ok: true; next: string } | { ok: false; error: "wrong" | "locked" };
export type ChooseResult = { ok: true; next: string } | { ok: false; error: "taken" };

/** A session cookie for this browser. */
function startSession() {
  const sessions = new SessionRepo(getDb());
  sessions.prune();
  setCookie(SESSION_COOKIE, sessions.create(), sessionCookieOptions(getRequest()));
}

/** Whether logins are on (EXPECTING_LOGIN), and whether a password is chosen: until one is, /login asks for one. */
export const getAccess = createServerFn({ method: "GET" }).handler(() => ({
  login: loginOn(),
  passwordSet: new PasswordRepo(getDb()).hash() !== null,
}));

/** Whether logins are on, and whether the password is chosen. */
export type Access = Awaited<ReturnType<typeof getAccess>>;

/**
 * The password, chosen by whoever visits first, and this browser
 * logged in with it. Refused once one is set: whoever chose it first keeps it,
 * and starting again means a new database.
 */
export const choosePassword = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(MIN_PASSWORD).max(1024), next: z.string().optional() }).strict())
  .handler(async ({ data }): Promise<ChooseResult> => {
    if (!new PasswordRepo(getDb()).choose(await hashPassword(data.password))) return { ok: false, error: "taken" };
    startSession();
    return { ok: true, next: safeNext(data.next) };
  });

/** The password: a session cookie for this browser, and where to go now. */
export const login = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().max(1024), next: z.string().optional() }).strict())
  .handler(async ({ data }): Promise<LoginResult> => {
    const key = clientKey(getRequest());
    if (limiter.locked(key)) return { ok: false, error: "locked" };

    const hash = new PasswordRepo(getDb()).hash();
    if (!hash || !(await verifyPassword(data.password, hash))) {
      limiter.fail(key);
      return { ok: false, error: limiter.locked(key) ? "locked" : "wrong" };
    }

    limiter.succeed(key);
    startSession();
    return { ok: true, next: safeNext(data.next) };
  });

/** Ends this browser's session. */
export const logout = createServerFn({ method: "POST" }).handler(() => {
  const token = readSessionCookie(getRequest());
  if (token) new SessionRepo(getDb()).end(token);
  deleteCookie(SESSION_COOKIE, { path: "/" });
});

export const accessQuery = queryOptions({ queryKey: ["access"], queryFn: () => getAccess() });

/** accessQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useAccessQuery<TData = Access>(options?: Omit<UseSuspenseQueryOptions<Access, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...accessQuery, ...options } as UseSuspenseQueryOptions<Access, Error, TData, string[]>);
}
