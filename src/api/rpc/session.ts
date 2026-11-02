// Setting up, logging in and out, and joining or choosing a new password by a
// code: the only server functions anyone may call without a session, since
// they are how you get one and how you end it. The gate opens this file by
// name (OPEN_FUNCTIONS in src/server/auth/gate.ts), so nothing else belongs here.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { InviteRepo, SessionRepo } from "../../db/models/auth/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { safeNext } from "../../lib/next";
import { type Person, ROLES, type Role } from "../../lib/people";
import { readSessionCookie, SESSION_COOKIE, sessionCookieOptions } from "../../server/auth/cookie";
import { clientKey, limiter, loginOn, sessionOf } from "../../server/auth/gate";
import { hashPassword, verifyPassword } from "../../server/auth/password";
import { getDb } from "../../server/core/db";

/** The shortest password allowed. */
export const MIN_PASSWORD = 8;

const role = z.enum(Object.keys(ROLES) as [Role, ...Role[]]);
const name = z.string().trim().min(1).max(60);
/** A new password: required with logins on, ignored with them off. */
const newPassword = z.string().min(MIN_PASSWORD).max(1024).optional();
const code = z.string().max(40);
const next = z.string().optional();

export type Locked = { ok: false; error: "locked" };
export type In = { ok: true; next: string };
export type LoginResult = In | Locked | { ok: false; error: "wrong" | "unknown" };
export type SetUpResult = In | { ok: false; error: "taken" | "password" };
export type CodeResult = In | Locked | { ok: false; error: "code" | "full" | "password" };

/** A session cookie for this browser, as `personId`. */
function startSession(personId: string) {
  const sessions = new SessionRepo(getDb());
  sessions.prune();
  setCookie(SESSION_COOKIE, sessions.create(personId), sessionCookieOptions(getRequest()));
}

/** The hash to keep for `password`: none with logins off; undefined, refusing, when logins are on and none was given. */
async function hashFor(password: string | undefined): Promise<string | null | undefined> {
  if (!loginOn()) return null;
  return password === undefined ? undefined : hashPassword(password);
}

/** A wrong code counts against the client, so guessing codes is as slow as guessing passwords. */
const codeKey = () => `code:${clientKey(getRequest())}`;

/**
 * Whether logins are on (EXPECTING_LOGIN), who's here to log in as (with
 * whether each has a password yet), and who this browser is logged in as.
 * Nobody here: /login sets Expecting up.
 */
export const getAccess = createServerFn({ method: "GET" }).handler(() => {
  const people = new PeopleRepo(getDb());
  return {
    login: loginOn(),
    people: people.list().map((p) => ({ ...p, hasPassword: people.password(p.id)?.hash != null })),
    me: sessionOf(getRequest()),
  };
});

/** Whether logins are on, who's here, and who this browser is. */
export type Access = Awaited<ReturnType<typeof getAccess>>;

/**
 * The first of you, on a new instance: which of you, your name and your
 * password, and this browser logged in as you. Refused once anyone is here:
 * the other joins by invite.
 */
export const setUp = createServerFn({ method: "POST" })
  .validator(z.object({ role, name, password: newPassword, next }).strict())
  .handler(async ({ data }): Promise<SetUpResult> => {
    const people = new PeopleRepo(getDb());
    if (people.list().length > 0) return { ok: false, error: "taken" };
    const passwordHash = await hashFor(data.password);
    if (passwordHash === undefined) return { ok: false, error: "password" };
    // Checked again: someone may have set it up while the hash was being made.
    if (people.list().length > 0) return { ok: false, error: "taken" };
    const person = people.add(data.name, data.role, { passwordHash });
    startSession(person.id);
    return { ok: true, next: safeNext(data.next) };
  });

/**
 * Logging in as one of you, with your password (none with logins off). One
 * who has never had one, from a time logins were off, chooses it here.
 */
export const login = createServerFn({ method: "POST" })
  .validator(z.object({ personId: z.uuid(), password: z.string().max(1024).optional(), next }).strict())
  .handler(async ({ data }): Promise<LoginResult> => {
    const people = new PeopleRepo(getDb());
    const password = people.password(data.personId);
    if (!password) return { ok: false, error: "unknown" };
    if (loginOn()) {
      const key = `${clientKey(getRequest())}:${data.personId}`;
      if (limiter.locked(key)) return { ok: false, error: "locked" };
      if (password.hash === null) {
        if (!data.password || data.password.length < MIN_PASSWORD) return { ok: false, error: "wrong" };
        people.setPassword(data.personId, await hashPassword(data.password));
      } else if (!data.password || !(await verifyPassword(data.password, password.hash))) {
        limiter.fail(key);
        return { ok: false, error: limiter.locked(key) ? "locked" : "wrong" };
      } else limiter.succeed(key);
    }
    startSession(data.personId);
    return { ok: true, next: safeNext(data.next) };
  });

/** What a code is for, to show before it is used: joining, as which of you and invited by whom, or choosing a new password, for whom. */
export type CodeFor = { kind: "join"; role: Role; by: string } | { kind: "reset"; name: string } | null;

/** What `code` is for, if it's live. A wrong one counts towards locking this client out. */
export const checkCode = createServerFn({ method: "POST" })
  .validator(z.object({ code, kind: z.enum(["join", "reset"]) }).strict())
  .handler(({ data }): CodeFor | "locked" => {
    const key = codeKey();
    if (limiter.locked(key)) return "locked";
    const people = new PeopleRepo(getDb());
    const invite = new InviteRepo(getDb()).find(data.code, data.kind);
    const by = invite && people.get(invite.by);
    const openRole = people.openRole();
    if (invite?.kind === "join" && by && openRole) return { kind: "join", role: openRole, by: by.name };
    const whose = invite?.personId ? people.get(invite.personId) : null;
    if (invite?.kind === "reset" && whose) return { kind: "reset", name: whose.name };
    limiter.fail(key);
    return null;
  });

/** Joining by invite, as the other of you: your name and password, and this browser logged in as you. */
export const join = createServerFn({ method: "POST" })
  .validator(z.object({ code, name, password: newPassword, next }).strict())
  .handler(async ({ data }): Promise<CodeResult> => {
    const key = codeKey();
    if (limiter.locked(key)) return { ok: false, error: "locked" };
    const db = getDb();
    const people = new PeopleRepo(db);
    const invites = new InviteRepo(db);
    if (!invites.find(data.code, "join")) {
      limiter.fail(key);
      return { ok: false, error: "code" };
    }
    const passwordHash = await hashFor(data.password);
    if (passwordHash === undefined) return { ok: false, error: "password" };
    let person: Person | null = null;
    db.transaction(() => {
      const role = people.openRole();
      // Taken meanwhile, or the code used meanwhile on another phone.
      if (!role || !invites.find(data.code, "join")) return;
      person = people.add(data.name, role, { passwordHash });
      invites.use(data.code);
    })();
    if (!person) return { ok: false, error: "full" };
    startSession((person as Person).id);
    return { ok: true, next: safeNext(data.next) };
  });

/** Choosing a new password by a reset code one of you made for the other: every phone of theirs is logged out, and this one in. */
export const resetPassword = createServerFn({ method: "POST" })
  .validator(z.object({ code, password: z.string().min(MIN_PASSWORD).max(1024), next }).strict())
  .handler(async ({ data }): Promise<CodeResult> => {
    const key = codeKey();
    if (limiter.locked(key)) return { ok: false, error: "locked" };
    const db = getDb();
    const invites = new InviteRepo(db);
    const invite = invites.find(data.code, "reset");
    if (!invite?.personId) {
      limiter.fail(key);
      return { ok: false, error: "code" };
    }
    const hash = await hashPassword(data.password);
    const personId = invite.personId;
    db.transaction(() => {
      new PeopleRepo(db).setPassword(personId, hash);
      new SessionRepo(db).endAllFor(personId);
      invites.use(data.code);
    })();
    startSession(personId);
    return { ok: true, next: safeNext(data.next) };
  });

/** Ends this browser's session. */
export const logout = createServerFn({ method: "POST" }).handler(() => {
  const token = readSessionCookie(getRequest());
  if (token) new SessionRepo(getDb()).end(token);
  deleteCookie(SESSION_COOKIE, { path: "/" });
});

/** What `code` is for: checked once (a wrong one counts against you), never again on its own. */
export function codeQuery(kind: "join" | "reset", code: string) {
  return queryOptions({
    queryKey: ["code", kind, code],
    queryFn: () => checkCode({ data: { code, kind } }),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

export const accessQuery = queryOptions({ queryKey: ["access"], queryFn: () => getAccess() });

/** accessQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useAccessQuery<TData = Access>(options?: Omit<UseSuspenseQueryOptions<Access, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...accessQuery, ...options } as UseSuspenseQueryOptions<Access, Error, TData, string[]>);
}
