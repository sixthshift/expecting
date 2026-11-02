// The two of you, and your accounts: who this phone is logged in as, choosing
// your own password, logging out everywhere, an invite for the other to join,
// and a link for the other to choose a new password. Getting in in the first
// place is src/api/rpc/session.ts, the one file open without a session.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { InviteRepo, SessionRepo } from "../../db/models/auth/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { readSessionCookie, SESSION_COOKIE } from "../../server/auth/cookie";
import { loginOn } from "../../server/auth/gate";
import { hashPassword, verifyPassword } from "../../server/auth/password";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";
import { MIN_PASSWORD } from "./session";

/** Who's logged in on this phone; every function here needs it, and the gate saw to it. */
function me(): string {
  const id = personId();
  if (!id) throw new Error("Log in first");
  return id;
}

/**
 * The two of you, who's holding this phone, and what's left to sort out:
 * whether you must choose your own password (logins on, and yours is still
 * the shared one from before accounts, or none), and the place left for the
 * other to join, if any.
 */
export const getPeople = createServerFn({ method: "GET" }).handler(() => {
  const people = new PeopleRepo(getDb());
  const id = personId();
  const password = id ? people.password(id) : null;
  return {
    me: id ? people.get(id) : null,
    people: people.list(),
    mustChoosePassword: loginOn() && password !== null && !password.chosen,
    openRole: people.openRole(),
  };
});

export type ChangeResult = { ok: true } | { ok: false; error: "wrong" };

/**
 * Your own password. The current one is asked, unless you must choose one
 * (still the shared one, just logged in with), or logins are off: then
 * whoever reaches Expecting is trusted already, and this is the way back in
 * for one of you alone who forgot theirs (turn logins off, choose a new one,
 * turn them on). Your other phones are logged out; this one stays in.
 */
export const choosePassword = createServerFn({ method: "POST" })
  .validator(z.object({ current: z.string().max(1024).optional(), password: z.string().min(MIN_PASSWORD).max(1024) }).strict())
  .handler(async ({ data }): Promise<ChangeResult> => {
    const id = me();
    const people = new PeopleRepo(getDb());
    const password = people.password(id);
    if (loginOn() && password?.chosen && !(password.hash && data.current && (await verifyPassword(data.current, password.hash))))
      return { ok: false, error: "wrong" };
    people.setPassword(id, await hashPassword(data.password));
    new SessionRepo(getDb()).endAllFor(id, readSessionCookie(getRequest()) ?? undefined);
    return { ok: true };
  });

/** Every phone and computer logged in as you logs out, this one too. */
export const logOutEverywhere = createServerFn({ method: "POST" }).handler(() => {
  new SessionRepo(getDb()).endAllFor(me());
  deleteCookie(SESSION_COOKIE, { path: "/" });
});

/** An invite for the other to join, while there's a place: a code to send, in a link, alive a week. A new one ends the last. */
export const makeInvite = createServerFn({ method: "POST" }).handler(() => {
  const by = me();
  const role = new PeopleRepo(getDb()).openRole();
  if (!role) throw new Error("There are two of you already");
  return { ...new InviteRepo(getDb()).create("join", by), role };
});

/** A link for the other of you to choose a new password, alive a day. Using it logs out every phone of theirs. */
export const makeReset = createServerFn({ method: "POST" }).handler(() => {
  if (!loginOn()) throw new Error("Logins are off");
  const by = me();
  const other = new PeopleRepo(getDb()).list().find((p) => p.id !== by);
  if (!other) throw new Error("There's nobody else");
  return { ...new InviteRepo(getDb()).create("reset", by, other.id), name: other.name };
});

export type People = Awaited<ReturnType<typeof getPeople>>;
export const peopleQuery = queryOptions({ queryKey: ["people"], queryFn: () => getPeople() });

/** peopleQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function usePeopleQuery<TData = People>(options?: Omit<UseSuspenseQueryOptions<People, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...peopleQuery, ...options } as UseSuspenseQueryOptions<People, Error, TData, string[]>);
}
